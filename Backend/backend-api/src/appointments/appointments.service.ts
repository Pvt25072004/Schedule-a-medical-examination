import { Injectable, BadRequestException, InternalServerErrorException, Logger, ForbiddenException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Repository, MoreThanOrEqual, In, DataSource, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PricingService } from '../pricing/pricing.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '../notifications/entities/notification.entity';
import { ServicePackage } from '../service-packages/entities/service-package.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
    private pricingService: PricingService,
    private firebaseService: FirebaseService,
    private notificationsService: NotificationsService,
    private dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(AppointmentsService.name);

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const fs = require('fs');
    fs.appendFileSync('payload_log.txt', new Date().toISOString() + ' PAYLOAD: ' + JSON.stringify(createAppointmentDto) + '\n');
    console.log('PAYLOAD:', JSON.stringify(createAppointmentDto, null, 2));
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // Bắt đầu Transaction với cơ chế khoá dòng (Pessimistic Lock)
    await queryRunner.startTransaction();

    try {
      let schedule: Schedule | null = null;
      const appointmentDateStr = createAppointmentDto.appointment_date.slice(0, 10);
      const appointmentTime = createAppointmentDto.appointment_time;

      if (createAppointmentDto.schedule_id) {
        schedule = await queryRunner.manager
          .createQueryBuilder(Schedule, 'schedule')
          .setLock('pessimistic_write')
          .where('schedule.id = :id', { id: createAppointmentDto.schedule_id })
          .getOne();
      } else {
        schedule = await queryRunner.manager
          .createQueryBuilder(Schedule, 'schedule')
          .setLock('pessimistic_write')
          .where('schedule.doctor_id = :doctorId', {
            doctorId: createAppointmentDto.doctor_id,
          })
          .andWhere('schedule.work_date = :workDate', {
            workDate: appointmentDateStr,
          })
          .andWhere('schedule.start_time <= :appointmentTime', {
            appointmentTime,
          })
          .andWhere('schedule.end_time >= :appointmentTime', {
            appointmentTime,
          })
          .getOne();
      }

      if (!schedule) {
        throw new BadRequestException('Không tìm thấy lịch làm việc phù hợp của bác sĩ vào thời gian đã chọn!');
      }

      if (!schedule.is_available) {
        throw new BadRequestException('Ca làm việc này của bác sĩ hiện đã tạm ngưng hoặc không khả dụng. Vui lòng chọn ca khác!');
      }

      // -- NEW: Override hospital_id to match the actual schedule's hospital --
      createAppointmentDto.hospital_id = schedule.hospital_id;

      // -- NEW: Xử lý Service Package & duration --
      let durationMinutes = 30; // default
      let servicePackagePrice: number | null = null;
      if (createAppointmentDto.service_package_id) {
        const servicePackage = await queryRunner.manager.findOneBy(ServicePackage, { id: createAppointmentDto.service_package_id });
        if (!servicePackage) {
          throw new BadRequestException('Gói khám không tồn tại!');
        }
        if (!servicePackage.is_active) {
          throw new BadRequestException('Gói khám này hiện đang tạm ngưng!');
        }
        durationMinutes = servicePackage.duration_minutes || 30;
        servicePackagePrice = Number(servicePackage.fixed_price) || 0;
      }

      const [h, m] = appointmentTime.split(':').map(Number);
      const totalStartMins = h * 60 + m;
      let totalEndMins = totalStartMins + durationMinutes;

      // Xử lý Vắt Ca (Nghỉ trưa từ 11:30 đến 13:00)
      const morningEndMins = 11 * 60 + 30; // 11:30
      const lunchDuration = 90; // 1.5 hours

      if (totalStartMins < morningEndMins && totalEndMins > morningEndMins) {
        totalEndMins += lunchDuration;
      }

      const endH = Math.floor(totalEndMins / 60);
      const endM = totalEndMins % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;


      // KIỂM TRA MỚI: Check trùng giờ cụ thể dựa vào overlap
      const overlapConflict = await queryRunner.manager
        .createQueryBuilder(Appointment, 'appt')
        .where('appt.doctor_id = :doctorId', { doctorId: createAppointmentDto.doctor_id })
        .andWhere('appt.appointment_date = :appointmentDate', { appointmentDate: appointmentDateStr })
        .andWhere('appt.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'completed'] })
        .andWhere('appt.appointment_time < :newEndTime', { newEndTime: endTime })
        .andWhere('COALESCE(appt.end_time, ADDTIME(appt.appointment_time, "00:30:00")) > :newStartTime', { newStartTime: appointmentTime })
        .getCount();

      if (overlapConflict > 0) {
        throw new BadRequestException(`Khung giờ từ ${appointmentTime} đến ${endTime} bị trùng với lịch khám khác của bác sĩ. Vui lòng chọn khung giờ khác!`);
      }

      // Kiểm tra sức chứa của cả ca
      const existingAppointmentsCount = await queryRunner.manager.count(Appointment, {
        where: {
          schedule_id: schedule.id,
          status: In(['pending', 'confirmed', 'completed']),
        },
      });

      if (existingAppointmentsCount >= schedule.max_patients) {
        throw new BadRequestException(`Ca làm việc này đã đầy bệnh nhân (tối đa ${schedule.max_patients} người/ca). Vui lòng chọn ca khám khác!`);
      }

      // KIỂM TRA: Chỉ cho phép tối đa 2 lượt đặt khám thanh toán tại quầy đang chờ (pending)
      if (createAppointmentDto.payment_method === 'cash') {
        const cashAppointmentsCount = await queryRunner.manager
          .createQueryBuilder(Appointment, 'appt')
          .innerJoin('appt.payment', 'payment')
          .where('appt.user_id = :userId', { userId: createAppointmentDto.user_id })
          .andWhere('appt.status = :status', { status: 'pending' })
          .andWhere('payment.payment_method = :paymentMethod', { paymentMethod: 'cash' })
          .getCount();

        if (cashAppointmentsCount >= 2) {
          throw new BadRequestException('Bạn đang có 2 lịch hẹn thanh toán tại quầy chưa được xử lý. Vui lòng hoàn thành lịch hẹn cũ hoặc chọn phương thức thanh toán trực tuyến.');
        }
      }

      createAppointmentDto.schedule_id = schedule.id;

      const [doctor, hospital] = await Promise.all([
        queryRunner.manager.findOne(Doctor, { where: { id: createAppointmentDto.doctor_id }, relations: ['user'] }),
        queryRunner.manager.findOneBy(Hospital, { id: createAppointmentDto.hospital_id }),
      ]);

      if (!doctor || !hospital) {
        throw new BadRequestException('Thông tin bác sĩ hoặc bệnh viện không hợp lệ!');
      }

      const pricing = this.pricingService.calculateAppointmentFee(doctor, hospital);

      const appointment = queryRunner.manager.create(Appointment, {
        ...createAppointmentDto,
        end_time: endTime,
        doctor_fee_snapshot: servicePackagePrice !== null ? 0 : pricing.doctorFeeSnapshot,
        hospital_fee_snapshot: servicePackagePrice !== null ? 0 : pricing.hospitalFeeSnapshot,
        total_fee: servicePackagePrice !== null ? servicePackagePrice : pricing.totalFee,
        doctor_name_snapshot: pricing.doctorNameSnapshot,
        hospital_name_snapshot: pricing.hospitalNameSnapshot,
        currency_snapshot: pricing.currencySnapshot,
      });

      const savedAppointment = await queryRunner.manager.save(Appointment, appointment);

      // Lưu thông báo in-app
      try {
        const notification = queryRunner.manager.create(Notification, {
          user_id: savedAppointment.user_id,
          title: '🎉 Đặt lịch hẹn khám thành công!',
          body: `Lịch khám của bạn với bác sĩ ${savedAppointment.doctor_name_snapshot || ''} tại ${savedAppointment.hospital_name_snapshot || ''} vào lúc ${savedAppointment.appointment_time} ngày ${savedAppointment.appointment_date} đã được ghi nhận và đang chờ xác nhận.`,
          type: 'appointment_pending',
        });
        await queryRunner.manager.save(Notification, notification);
      } catch (err) {
        console.error('🔥 Lỗi tạo thông báo in-app (đặt lịch):', err);
      }

      // -- NEW: Increment booking_count of ServicePackage --
      if (createAppointmentDto.service_package_id) {
        await queryRunner.manager.increment(ServicePackage, { id: createAppointmentDto.service_package_id }, 'booking_count', 1);
      }

      await queryRunner.commitTransaction();
      return savedAppointment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('🔥 Lỗi tạo lịch khám:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra trong quá trình xử lý đặt lịch.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user?: any): Promise<Appointment[]> {
    if (user?.role === 'admin_hospital') {
      if (!user.hospital_id) {
        throw new ForbiddenException('Tài khoản admin cơ sở không có thông tin bệnh viện');
      }
      return await this.appointmentsRepository.find({
        where: { hospital_id: user.hospital_id },
        relations: ['user', 'doctor', 'hospital', 'payment'],
        order: { created_at: 'DESC' }
      });
    }
    return await this.appointmentsRepository.find({
      relations: ['user', 'doctor', 'hospital', 'payment'],
      order: { created_at: 'DESC' }
    });
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    user?: any,
  ): Promise<Appointment> {
    const appointment = (await this.findOne(id)) as Appointment;
    if (!appointment) throw new BadRequestException('Không tìm thấy lịch hẹn');
    
    if (user?.role === 'admin_hospital' && appointment.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền sửa lịch hẹn của cơ sở khác');
    }

    // Nếu đổi bác sĩ, ngày hoặc giờ, kiểm tra xung đột lịch của bác sĩ mới
    const newDoctorId = updateAppointmentDto.doctor_id || appointment.doctor_id;
    const newDate = updateAppointmentDto.appointment_date || appointment.appointment_date;
    const newTime = updateAppointmentDto.appointment_time || appointment.appointment_time;

    if (
      updateAppointmentDto.doctor_id ||
      updateAppointmentDto.appointment_date ||
      updateAppointmentDto.appointment_time
    ) {
      const dateStr = String(newDate).slice(0, 10);
      
      const overlapConflict = await this.appointmentsRepository
        .createQueryBuilder('appt')
        .where('appt.doctor_id = :doctorId', { doctorId: newDoctorId })
        .andWhere('DATE(appt.appointment_date) = :appointmentDate', { appointmentDate: dateStr })
        .andWhere('appt.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'completed'] })
        .andWhere('appt.id != :id', { id: appointment.id }) // trừ chính nó ra
        // Giả sử mỗi lịch khám kéo dài 30 phút
        .andWhere('appt.appointment_time < ADDTIME(:newTime, "00:30:00")', { newTime })
        .andWhere('COALESCE(appt.end_time, ADDTIME(appt.appointment_time, "00:30:00")) > :newTime', { newTime })
        .getCount();

      if (overlapConflict > 0) {
        throw new BadRequestException('Bác sĩ mới đã có lịch hẹn trùng vào khung giờ này!');
      }

      // Cập nhật cancel_reason nếu là đổi lịch
      if (!updateAppointmentDto.cancel_reason) {
        updateAppointmentDto.cancel_reason = 'Đã được dời/đổi lịch bởi Admin hoặc Bác sĩ';
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: number, user?: any) {
    const appointment = (await this.findOne(id)) as Appointment;
    if (!appointment) throw new BadRequestException('Không tìm thấy lịch hẹn');

    if (user?.role === 'admin_hospital' && appointment.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền xóa lịch hẹn của cơ sở khác');
    }

    return this.appointmentsRepository.remove(appointment);
  }

  async findByDoctor(doctorId: number, date?: string): Promise<Appointment[]> {
    const where: any = { doctor_id: doctorId };
    if (date) {
      where.appointment_date = date;
    } else {
      // mặc định lấy từ hôm nay trở đi
      where.appointment_date = MoreThanOrEqual(
        new Date().toISOString().slice(0, 10),
      );
    }

    return this.appointmentsRepository.find({
      where,
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['user', 'hospital', 'payment'],
    });
  }

  async findByUser(userId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { user_id: userId },
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['doctor', 'doctor.user', 'doctor.category', 'hospital', 'review', 'payment'],
    });
  }

  async findBySchedule(scheduleId: number, user?: any): Promise<Appointment[]> {
    const where: any = { schedule_id: scheduleId };
    if (user?.role === 'admin_hospital') {
      where.hospital_id = user.hospital_id;
    }
    return this.appointmentsRepository.find({
      where,
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['user', 'doctor', 'hospital', 'payment'],
    });
  }

  async updateStatus(
    id: number,
    status: string,
    reason?: string,
    user?: any,
  ): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'doctor', 'doctor.user'],
    });
    
    if (!appointment) {
      throw new Error(`Appointment #${id} not found`);
    }

    if (user?.role === 'admin_hospital' && appointment.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái lịch hẹn của cơ sở khác');
    }

    if (user?.role === 'patient' && appointment.user_id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    if (user?.role === 'doctor' && appointment.doctor?.user?.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái lịch hẹn của bác sĩ khác');
    }

    appointment.status = status;
    if (status === 'rejected') {
      appointment.cancel_reason = reason || null;
    } else if (status === 'confirmed' || status === 'completed') {
      // Khi xác nhận / hoàn thành thì xóa lý do hủy trước đó (nếu có)
      appointment.cancel_reason = null;
    }
    const saved = await this.appointmentsRepository.save(appointment);

    // Lưu thông báo in-app
    try {
      let title = 'Cập nhật lịch khám';
      let body = `Lịch hẹn khám của bạn vào lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã chuyển sang trạng thái: ${status}`;
      let type = 'system';

      if (status === 'confirmed') {
        title = '🎉 Lịch hẹn khám đã được xác nhận!';
        body = `Lịch khám của bạn với bác sĩ ${saved.doctor_name_snapshot || ''} tại ${saved.hospital_name_snapshot || ''} lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã được xác nhận thành công.`;
        type = 'appointment_confirmed';
      } else if (status === 'rejected' || status === 'cancelled') {
        title = '⚠️ Lịch hẹn khám đã bị hủy';
        body = `Lịch khám của bạn lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã bị hủy.${reason ? ` Lý do: ${reason}` : ''}`;
        type = 'appointment_cancelled';
      } else if (status === 'completed') {
        title = '✅ Buổi khám hoàn thành';
        body = `Cảm ơn bạn đã sử dụng dịch vụ! Buổi khám lúc ${saved.appointment_time} ngày ${saved.appointment_date} với bác sĩ ${saved.doctor_name_snapshot || ''} đã hoàn thành tốt đẹp.`;
        type = 'appointment_completed';
      }

      await this.notificationsService.create({
        user_id: saved.user_id,
        title,
        body,
        type,
      });
    } catch (err) {
      console.error('🔥 Lỗi tạo thông báo in-app (cập nhật status):', err);
    }

    // Gửi thông báo qua FCM nếu có user và fcm_token
    if (saved.user && saved.user.fcm_token) {
      // Kiểm tra cấu hình cài đặt thông báo của user (nếu có)
      const settings = saved.user.notification_settings;
      const isPushEnabled = settings ? (settings.enabled !== false && settings.push_confirmation !== false) : true;

      if (isPushEnabled) {
        let title = 'Cập nhật trạng thái lịch hẹn';
        let body = `Lịch hẹn khám của bạn vào lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã chuyển sang trạng thái: ${status}`;

        if (status === 'confirmed') {
          title = '🎉 Lịch hẹn khám đã được xác nhận!';
          body = `Chúc mừng! Lịch khám của bạn với bác sĩ ${saved.doctor_name_snapshot || ''} tại ${saved.hospital_name_snapshot || ''} lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã được xác nhận thành công.`;
        } else if (status === 'rejected' || status === 'cancelled') {
          title = '⚠️ Lịch hẹn khám đã bị hủy';
          body = `Lịch khám của bạn lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã bị hủy.${reason ? ` Lý do: ${reason}` : ''}`;
        }

        try {
          await this.firebaseService.sendPushNotification(saved.user.fcm_token, title, body, {
            appointmentId: String(saved.id),
            status: saved.status,
          });
        } catch (err) {
          console.error('🔥 Gửi Push Notification thất bại:', err);
        }
      }
    }

    return saved;
  }

  async getAvailableTimes(doctorId: number, date: string): Promise<string[]> {
    // 1. Fetch all schedules for this doctor on this date
    const schedules = await this.schedulesRepository.find({
      where: { doctor_id: doctorId, work_date: date as any, is_available: true },
    });

    if (schedules.length === 0) {
      return [];
    }

    // 2. Fetch all appointments for this doctor on this date
    const appointments = await this.appointmentsRepository.find({
      where: {
        doctor_id: doctorId,
        appointment_date: date as any, // TypeORM expected Date object but string "YYYY-MM-DD" works for DB
        status: In(['pending', 'confirmed', 'completed']),
      },
    });

    // 3. Collect booked times (hỗ trợ block theo duration)
    const bookedSlots = new Set<string>();
    for (const appt of appointments) {
      const startStr = appt.appointment_time.slice(0, 5); // "HH:mm"
      const endStr = appt.end_time ? appt.end_time.slice(0, 5) : null;

      let [sH, sM] = startStr.split(':').map(Number);
      const startTotal = sH * 60 + sM;

      let endTotal = startTotal + 30; // default
      if (endStr) {
        let [eH, eM] = endStr.split(':').map(Number);
        endTotal = eH * 60 + eM;
      }

      for (let t = startTotal; t < endTotal; t += 30) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        const slotStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        bookedSlots.add(slotStr);
      }
    }

    // 4. Generate all 30-min slots based on schedules
    const availableSlots = new Set<string>();
    // Lấy giờ Việt Nam (UTC+7)
    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const isToday = date === vnTime.toISOString().slice(0, 10);
    const currentHour = vnTime.getUTCHours();
    const currentMinute = vnTime.getUTCMinutes();
    const currentTotalMins = currentHour * 60 + currentMinute;

    for (const schedule of schedules) {
      const start = schedule.start_time.slice(0, 5); // "HH:mm"
      const end = schedule.end_time.slice(0, 5);

      if (!start || !end) continue;

      let [h, m] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const endTotalMins = endH * 60 + endM;

      while (h * 60 + m < endTotalMins) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        // Check if past current time (if today)
        let isPast = false;
        if (isToday) {
          const slotTotalMins = h * 60 + m;
          // Thêm 30p buffer cho an toàn
          if (slotTotalMins <= currentTotalMins + 30) {
            isPast = true;
          }
        }

        if (!isPast && !bookedSlots.has(timeStr)) {
          const slotTotalMins = h * 60 + m;
          // Loại bỏ giờ nghỉ trưa (11:30 - 13:00)
          if (slotTotalMins >= 11 * 60 + 30 && slotTotalMins < 13 * 60) {
            // Không thêm slot này
          } else {
            availableSlots.add(timeStr);
          }
        }

        m += 30;
        if (m >= 60) {
          h += 1;
          m -= 60;
        }
      }
    }

    return Array.from(availableSlots).sort();
  }
  async getAvailableTimesForPackage(packageId: number, date: string): Promise<string[]> {
    const servicePackage = await this.dataSource.manager.findOne(ServicePackage, { 
      where: { id: packageId }, 
      relations: ['doctors'] 
    });

    if (!servicePackage || !servicePackage.doctors || servicePackage.doctors.length === 0) {
      return [];
    }

    const durationMinutes = servicePackage.duration_minutes || 30;
    const allAvailableSlots = new Set<string>();

    for (const doctor of servicePackage.doctors) {
      const times = await this.getAvailableTimes(doctor.id, date);
      
      // Filter times that can accommodate the duration
      for (const time of times) {
        let isValid = true;
        
        // We must check if the time slot + duration doesn't overlap with another booked appointment
        // We can do a quick check by verifying all 30-min sub-slots are in the 'times' array,
        // EXCEPT if there's a lunch break jump.
        
        // Let's do the rigorous check via DB count (same as create)
        const [h, m] = time.split(':').map(Number);
        const totalStartMins = h * 60 + m;
        let totalEndMins = totalStartMins + durationMinutes;

        const morningEndMins = 11 * 60 + 30; // 11:30
        const lunchDuration = 90; // 1.5 hours

        if (totalStartMins < morningEndMins && totalEndMins > morningEndMins) {
          totalEndMins += lunchDuration;
        }

        const endH = Math.floor(totalEndMins / 60);
        const endM = totalEndMins % 60;
        const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        const overlapConflict = await this.dataSource.manager
          .createQueryBuilder(Appointment, 'appt')
          .where('appt.doctor_id = :doctorId', { doctorId: doctor.id })
          .andWhere('appt.appointment_date = :appointmentDate', { appointmentDate: date })
          .andWhere('appt.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'completed'] })
          .andWhere('appt.appointment_time < :newEndTime', { newEndTime: endTimeStr })
          .andWhere('COALESCE(appt.end_time, ADDTIME(appt.appointment_time, "00:30:00")) > :newStartTime', { newStartTime: time })
          .getCount();

        // Also check if end time exceeds hospital schedule (assume max 17:00 = 17*60 = 1020)
        // If end time is past 17:00, it's invalid.
        if (totalEndMins > 17 * 60) {
           isValid = false;
        }

        if (overlapConflict > 0) {
          isValid = false;
        }

        if (isValid) {
          allAvailableSlots.add(time);
        }
      }
    }

    return Array.from(allAvailableSlots).sort();
  }

  async getAvailableDoctorsForPackage(packageId: number, date: string, time: string): Promise<Doctor[]> {
    const servicePackage = await this.dataSource.manager.findOne(ServicePackage, { 
      where: { id: packageId }, 
      relations: ['doctors', 'doctors.user'] 
    });

    if (!servicePackage || !servicePackage.doctors || servicePackage.doctors.length === 0) {
      return [];
    }

    const durationMinutes = servicePackage.duration_minutes || 30;
    const availableDoctors: Doctor[] = [];

    const [h, m] = time.split(':').map(Number);
    const totalStartMins = h * 60 + m;
    let totalEndMins = totalStartMins + durationMinutes;

    const morningEndMins = 11 * 60 + 30; // 11:30
    const lunchDuration = 90; // 1.5 hours

    if (totalStartMins < morningEndMins && totalEndMins > morningEndMins) {
      totalEndMins += lunchDuration;
    }

    const endH = Math.floor(totalEndMins / 60);
    const endM = totalEndMins % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    if (totalEndMins > 17 * 60) {
      return []; // Exceeds hospital hours
    }

    for (const doctor of servicePackage.doctors) {
      // Check if doctor has a valid schedule for this time
      const schedule = await this.dataSource.manager.createQueryBuilder(Schedule, 'schedule')
        .where('schedule.doctor_id = :doctorId', { doctorId: doctor.id })
        .andWhere('schedule.work_date = :workDate', { workDate: date })
        .andWhere('schedule.start_time <= :time', { time })
        .andWhere('schedule.end_time >= :time', { time })
        .andWhere('schedule.is_available = true')
        .getOne();

      if (!schedule) continue;

      // Check overlap
      const overlapConflict = await this.dataSource.manager
        .createQueryBuilder(Appointment, 'appt')
        .where('appt.doctor_id = :doctorId', { doctorId: doctor.id })
        .andWhere('appt.appointment_date = :appointmentDate', { appointmentDate: date })
        .andWhere('appt.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'completed'] })
        .andWhere('appt.appointment_time < :newEndTime', { newEndTime: endTimeStr })
        .andWhere('COALESCE(appt.end_time, ADDTIME(appt.appointment_time, "00:30:00")) > :newStartTime', { newStartTime: time })
        .getCount();

      if (overlapConflict === 0) {
        // Map to include name and avatar for frontend convenience
        availableDoctors.push({
          ...doctor,
          name: doctor.user?.full_name || 'Bác sĩ ẩn danh',
          avatar_url: doctor.user?.avatar_url || ''
        } as any);
      }
    }

    return availableDoctors;
  }

  // Chạy mỗi 5 phút để dọn dẹp các lịch pending quá 15 phút
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCleanupPendingAppointments() {
    this.logger.log('Running cleanup for expired pending appointments...');
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() - 15);

    const expiredAppointments = await this.appointmentsRepository.find({
      where: {
        status: 'pending',
        created_at: LessThan(expirationTime),
      },
    });

    if (expiredAppointments.length > 0) {
      for (const appt of expiredAppointments) {
        appt.status = 'cancelled';
        appt.cancel_reason = 'Hệ thống tự động hủy do quá hạn thanh toán (15 phút)';
      }
      await this.appointmentsRepository.save(expiredAppointments);
      this.logger.log(`Auto-cancelled ${expiredAppointments.length} expired appointments.`);
    }
  }

  async requestRefund(appointmentId: number, user: any): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('Không tìm thấy lịch hẹn');
    }

    if (appointment.user_id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    if (!['cancelled', 'rejected'].includes(appointment.status)) {
      throw new BadRequestException('Chỉ có thể yêu cầu hoàn tiền cho lịch hẹn đã bị hủy');
    }

    if (appointment.refund_status !== 'none') {
      throw new BadRequestException('Lịch hẹn này đã có yêu cầu hoàn tiền trước đó');
    }

    appointment.refund_status = 'requested';
    await this.appointmentsRepository.save(appointment);

    // Send notification to admin_hospital
    try {
      await this.notificationsService.create({
        user_id: user.id,
        title: 'Yêu cầu hoàn tiền',
        body: `Bệnh nhân yêu cầu hoàn tiền cho lịch hẹn #${appointmentId}.`,
        type: 'refund_request',
      });
    } catch (e) {
      this.logger.warn('Could not send refund notification: ' + e.message);
    }

    return appointment;
  }

  async reschedule(
    appointmentId: number,
    dto: import('./dto/reschedule-appointment.dto').RescheduleAppointmentDto,
    user: any,
  ): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('Không tìm thấy lịch hẹn');
    }

    if (appointment.user_id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    if (!['cancelled', 'rejected'].includes(appointment.status)) {
      throw new BadRequestException('Chỉ có thể dời lịch cho lịch hẹn đã bị hủy');
    }

    if (appointment.refund_status === 'requested' || appointment.refund_status === 'completed') {
      throw new BadRequestException('Lịch hẹn này đã có yêu cầu hoàn tiền, không thể dời lịch');
    }

    // Verify new schedule exists and has capacity
    const newSchedule = await this.schedulesRepository.findOne({
      where: { id: dto.schedule_id },
    });
    if (!newSchedule) {
      throw new BadRequestException('Ca làm việc không tồn tại');
    }
    const existingAppointmentsCount = await this.appointmentsRepository.count({
      where: {
        schedule_id: dto.schedule_id,
        status: In(['pending', 'confirmed', 'completed']),
      },
    });

    if (existingAppointmentsCount >= newSchedule.max_patients) {
      throw new BadRequestException('Ca làm việc đã đầy, vui lòng chọn ca khác');
    }

    // Update appointment with new schedule info, reset status to pending
    appointment.doctor_id = dto.doctor_id;
    appointment.hospital_id = dto.hospital_id;
    appointment.schedule_id = dto.schedule_id;
    appointment.appointment_date = dto.appointment_date as any;
    appointment.appointment_time = dto.appointment_time;
    appointment.status = 'pending';
    appointment.cancel_reason = null;
    appointment.refund_status = 'none';

    if (dto.doctor_name_snapshot) {
      appointment.doctor_name_snapshot = dto.doctor_name_snapshot;
    }
    if (dto.hospital_name_snapshot) {
      appointment.hospital_name_snapshot = dto.hospital_name_snapshot;
    }



    await this.appointmentsRepository.save(appointment);

    return appointment;
  }
}
