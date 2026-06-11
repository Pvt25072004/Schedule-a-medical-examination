import { Injectable, BadRequestException, InternalServerErrorException, Logger, ForbiddenException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Repository, MoreThanOrEqual, In, DataSource, LessThan, Brackets } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PricingService } from '../pricing/pricing.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '../notifications/entities/notification.entity';
import { ServicePackage } from '../service-packages/entities/service-package.entity';
import { User } from '../users/entities/user.entity';

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
  ) { }

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
      let doctor: Doctor | null = null;
      let hospital: Hospital | null = null;
      let endTime: string | null = null;
      let durationMinutes = 30; // default
      let servicePackagePrice: number | null = null;
      let servicePackageName: string | null = null;

      // Handle Service Package First
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
        servicePackageName = servicePackage.name;
      }

      // Check if Date, Time, Doctor are provided
      const hasSpecificTime = createAppointmentDto.appointment_date && createAppointmentDto.appointment_time && createAppointmentDto.doctor_id;

      if (hasSpecificTime) {
        const appointmentDateStr = String(createAppointmentDto.appointment_date).slice(0, 10);
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

        createAppointmentDto.hospital_id = schedule.hospital_id;
        createAppointmentDto.schedule_id = schedule.id;

        const [h, m] = appointmentTime!.split(':').map(Number);
        const totalStartMins = h * 60 + m;
        let totalEndMins = totalStartMins + durationMinutes;

        const morningEndMins = 11 * 60 + 30; // 11:30
        const lunchDuration = 90; // 1.5 hours

        if (totalStartMins < morningEndMins && totalEndMins > morningEndMins) {
          totalEndMins += lunchDuration;
        }

        const endH = Math.floor(totalEndMins / 60);
        const endM = totalEndMins % 60;
        endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        const conflictEndH = Math.floor((totalStartMins + 30) / 60);
        const conflictEndM = (totalStartMins + 30) % 60;
        const conflictEndTime = `${String(conflictEndH).padStart(2, '0')}:${String(conflictEndM).padStart(2, '0')}`;

        const overlapConflict = await queryRunner.manager
          .createQueryBuilder(Appointment, 'appt')
          .where('appt.doctor_id = :doctorId', { doctorId: createAppointmentDto.doctor_id })
          .andWhere('appt.appointment_date = :appointmentDate', { appointmentDate: appointmentDateStr })
          .andWhere('appt.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'completed', 'checked_in', 'in_progress', 'awaiting_payment'] })
          .andWhere('appt.appointment_time < :newEndTime', { newEndTime: conflictEndTime })
          .andWhere("ADDTIME(appt.appointment_time, '00:30:00') > :newStartTime", { newStartTime: appointmentTime })
          .getCount();

        if (overlapConflict > 0) {
          throw new BadRequestException(`Khung giờ từ ${appointmentTime} đến ${endTime} bị trùng với lịch khám khác của bác sĩ. Vui lòng chọn khung giờ khác!`);
        }

        const existingAppointmentsCount = await queryRunner.manager.count(Appointment, {
          where: {
            schedule_id: schedule.id,
            status: In(['pending', 'confirmed', 'completed']),
          },
        });

        if (existingAppointmentsCount >= schedule.max_patients) {
          throw new BadRequestException(`Ca làm việc này đã đầy bệnh nhân (tối đa ${schedule.max_patients} người/ca). Vui lòng chọn ca khám khác!`);
        }

        doctor = await queryRunner.manager.findOne(Doctor, { where: { id: createAppointmentDto.doctor_id }, relations: ['user'] });
      } else {
        // Required for Service Package Open Booking
        if (!createAppointmentDto.service_package_id) {
          throw new BadRequestException('Bắt buộc phải chọn ngày giờ khám, HOẶC đặt qua Gói dịch vụ!');
        }
      }

      // NEW: Khóa tài khoản không cho đặt nếu có đơn chưa thanh toán/chưa xử lý
      const pendingAppointmentsCount = await queryRunner.manager
        .createQueryBuilder(Appointment, 'appt')
        .where('appt.user_id = :userId', { userId: createAppointmentDto.user_id })
        .andWhere('appt.status = :status', { status: 'pending' })
        .getCount();

      if (pendingAppointmentsCount >= 1) {
        throw new BadRequestException('Bạn đang có lịch hẹn chờ xử lý hoặc chưa thanh toán. Vui lòng thanh toán tiếp hoặc hủy lịch cũ trước khi đặt mới.');
      }

      hospital = await queryRunner.manager.findOneBy(Hospital, { id: createAppointmentDto.hospital_id });
      if (!hospital) {
        throw new BadRequestException('Bệnh viện không hợp lệ!');
      }

      let doctorFeeSnapshot = 0;
      let hospitalFeeSnapshot = 0;
      let totalFee = 0;
      let doctorNameSnapshot = '';
      let hospitalNameSnapshot = hospital.name;
      let currencySnapshot = 'VND';

      if (servicePackagePrice !== null) {
        totalFee = servicePackagePrice;
        if (doctor) {
          doctorNameSnapshot = doctor.user?.full_name || '';
        }
      } else if (doctor && hospital) {
        const pricing = this.pricingService.calculateAppointmentFee(doctor, hospital);
        doctorFeeSnapshot = pricing.doctorFeeSnapshot;
        hospitalFeeSnapshot = pricing.hospitalFeeSnapshot;
        totalFee = pricing.totalFee;
        doctorNameSnapshot = pricing.doctorNameSnapshot;
        currencySnapshot = pricing.currencySnapshot;
      }

      const appointment = queryRunner.manager.create(Appointment, {
        ...createAppointmentDto,
        end_time: endTime,
        doctor_fee_snapshot: doctorFeeSnapshot,
        hospital_fee_snapshot: hospitalFeeSnapshot,
        total_fee: totalFee,
        doctor_name_snapshot: doctorNameSnapshot,
        hospital_name_snapshot: hospitalNameSnapshot,
        currency_snapshot: currencySnapshot,
      });

      const savedAppointment = await queryRunner.manager.save(Appointment, appointment);

      // Lưu thông báo in-app
      try {
        const notification = queryRunner.manager.create(Notification, {
          user_id: savedAppointment.user_id,
          title: '🎉 Đặt lịch hẹn khám thành công!',
          body: savedAppointment.appointment_time && savedAppointment.appointment_date
            ? `Lịch khám của bạn với bác sĩ ${savedAppointment.doctor_name_snapshot || ''} tại ${savedAppointment.hospital_name_snapshot || ''} vào lúc ${savedAppointment.appointment_time} ngày ${savedAppointment.appointment_date} đã được ghi nhận và đang chờ xác nhận.`
            : `Lịch khám Gói dịch vụ "${servicePackageName || ''}" tại ${savedAppointment.hospital_name_snapshot || ''} của bạn đã được ghi nhận. Cơ sở y tế sẽ chủ động liên hệ và sắp xếp lịch khám cho bạn.`,
          type: 'appointment_pending',
        });
        await queryRunner.manager.save(Notification, notification);

        // --- NEW: Bắn FCM cho Bệnh nhân và Bác sĩ ---
        const patient = await queryRunner.manager.findOne(User, { where: { id: savedAppointment.user_id } });
        if (patient?.fcm_token) {
          this.firebaseService.sendPushNotification(
            patient.fcm_token,
            '🎉 Đặt lịch thành công!',
            'Lịch khám của bạn đã được ghi nhận và đang chờ xác nhận.',
            { appointmentId: String(savedAppointment.id), status: 'pending' }
          ).catch(e => console.error('FCM Patient err:', e));
        }
        if (doctor?.user?.fcm_token) {
          this.firebaseService.sendPushNotification(
            doctor.user.fcm_token,
            '🔔 Có lịch hẹn mới',
            `Bệnh nhân ${patient?.full_name || 'mới'} vừa đặt lịch vào lúc ${savedAppointment.appointment_time} ngày ${savedAppointment.appointment_date}.`,
            { appointmentId: String(savedAppointment.id), status: 'pending' }
          ).catch(e => console.error('FCM Doctor err:', e));
        }
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

  async findAll(user?: any, page: number = 1, limit: number = 100, status?: string, hospitalId?: string, search?: string): Promise<{ data: Appointment[]; total: number; page: number; limit: number; totalPages: number }> {
    const qb = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser') // also fetch doctor's user entity for full name
      .leftJoinAndSelect('appointment.hospital', 'hospital')
      .leftJoinAndSelect('appointment.payment', 'payment')
        .leftJoinAndSelect('appointment.schedule', 'schedule')
        .leftJoinAndSelect('schedule.room', 'room')
      .orderBy('appointment.created_at', 'DESC');

    if (user?.role === 'admin_hospital') {
      if (!user.hospital_id) {
        throw new ForbiddenException('Tài khoản admin cơ sở không có thông tin bệnh viện');
      }
      qb.andWhere('appointment.hospital_id = :userHospitalId', { userHospitalId: user.hospital_id });
    }

    if (status && status !== 'all') {
      qb.andWhere('appointment.status = :status', { status });
    }

    if (hospitalId && hospitalId !== 'all') {
      qb.andWhere('appointment.hospital_id = :filterHospitalId', { filterHospitalId: hospitalId });
    }

    if (search) {
      qb.andWhere(new Brackets(sqb => {
        sqb.where('appointment.patient_name LIKE :search', { search: `%${search}%` })
          .orWhere('appointment.patient_phone LIKE :search', { search: `%${search}%` })
          .orWhere('appointment.doctor_name_snapshot LIKE :search', { search: `%${search}%` })
          .orWhere('user.full_name LIKE :search', { search: `%${search}%` })
          .orWhere('user.phone LIKE :search', { search: `%${search}%` });

        if (!isNaN(Number(search))) {
          sqb.orWhere('appointment.id = :searchId', { searchId: Number(search) });
        }
      }));
    }

    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'schedule', 'schedule.room'],
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
        .andWhere("appt.appointment_time < ADDTIME(:newTime, '00:30:00')", { newTime })
        .andWhere("ADDTIME(appt.appointment_time, '00:30:00') > :newTime", { newTime })
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
      relations: ['user', 'hospital', 'payment', 'schedule', 'schedule.room'],
    });
  }

  async findByUser(userId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { user_id: userId },
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['doctor', 'doctor.user', 'doctor.category', 'hospital', 'review', 'payment', 'service_package', 'schedule', 'schedule.room'],
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
      relations: ['user', 'doctor', 'hospital', 'payment', 'schedule', 'schedule.room'],
    });
  }

  async updateStatus(
    id: number,
    dto: import('./dto/update-appointment-status.dto').UpdateAppointmentStatusDto,
    user?: any,
  ): Promise<Appointment> {
    const { status, reason, refund_bank_name, refund_bank_account, refund_account_name } = dto;
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'doctor', 'doctor.user', 'schedule', 'schedule.room'],
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

    const previousStatus = appointment.status;
    appointment.status = status;
    if (status === 'checked_in') {
      const now = new Date();
      const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      appointment.appointment_date = new Date(vnTime.toISOString().slice(0, 10));
      appointment.appointment_time = vnTime.toISOString().slice(11, 16);
    }
    if (status === 'rejected' || status === 'cancelled') {
      appointment.cancel_reason = reason || null;

      // LOGIC HOÀN TIỀN VÀ HỦY LỊCH
      if (user?.role === 'admin_hospital') {
        // Admin chủ động hủy -> Cho phép dời lịch miễn phí
        appointment.admin_cancelled_free_reschedule = true;
      } else if (user?.role === 'patient') {
        // Patient chủ động hủy -> Tính thời gian hoàn tiền
        if (appointment.appointment_date && appointment.appointment_time) {
          const appointmentDateStr = typeof appointment.appointment_date === 'string'
            ? appointment.appointment_date
            : (appointment.appointment_date as Date).toISOString().split('T')[0];
          const timeStr = appointment.appointment_time.length === 5 ? `${appointment.appointment_time}:00` : appointment.appointment_time;
          const appointmentDateTime = new Date(`${appointmentDateStr}T${timeStr}`);
          const now = new Date();
          const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Múi giờ VN

          const diffMs = appointmentDateTime.getTime() - vnTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          if (diffHours >= 2) {
            appointment.refund_percentage = 100;
          } else if (diffHours >= 1) {
            appointment.refund_percentage = 50;
          } else {
            appointment.refund_percentage = 0;
          }

          // Chỉ hoàn tiền nếu lịch này ĐÃ THANH TOÁN (confirmed)
          if (previousStatus === 'confirmed' && appointment.refund_percentage > 0) {
            // Nếu có thanh toán trước đó (PayOS / VNPay) và status trước đó không phải failed
            // Yêu cầu hoàn tiền
            appointment.refund_amount = Number(appointment.total_fee) * appointment.refund_percentage / 100;
            appointment.refund_status = 'requested';
            appointment.refund_bank_name = refund_bank_name ?? null;
            appointment.refund_bank_account = refund_bank_account ?? null;
            appointment.refund_account_name = refund_account_name ?? null;
          }
        }
      }
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
        if (saved.admin_cancelled_free_reschedule) {
          body += ' Do lỗi từ phía phòng khám, bạn có thể chọn Dời lịch miễn phí hoặc Yêu cầu hoàn tiền 100%.';
        }
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

    // Gửi thông báo qua FCM
    const patientFCM = saved.user?.fcm_token;

    if (status === 'checked_in') {
      // 1. Gửi FCM cho Bác sĩ báo bệnh nhân đã đến
      if (saved.doctor_id) {
        const doctorData = await this.doctorsRepository.findOne({
          where: { id: saved.doctor_id },
          relations: ['user']
        });
        const doctorFCM = doctorData?.user?.fcm_token;
        if (doctorFCM) {
          this.firebaseService.sendPushNotification(
            doctorFCM,
            '🔔 Bệnh nhân đã check-in',
            `Bệnh nhân ${saved.user?.full_name || 'Khách hàng'} đã có mặt tại phòng khám.`,
            { appointmentId: String(saved.id), status }
          ).catch(e => console.error(e));
        }
      }
    } else if (patientFCM) {
      // 2. Gửi FCM cho Bệnh nhân các trạng thái còn lại
      const settings = saved.user?.notification_settings;
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
          if (saved.admin_cancelled_free_reschedule) {
            body += ' Do lỗi từ phía phòng khám, bạn có thể chọn Dời lịch miễn phí hoặc Yêu cầu hoàn tiền 100%.';
          }
        } else if (status === 'completed') {
          title = '✅ Buổi khám hoàn tất';
          body = `Cảm ơn bạn đã sử dụng dịch vụ! Buổi khám lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã hoàn thành tốt đẹp.`;
        }

        try {
          await this.firebaseService.sendPushNotification(patientFCM, title, body, {
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
        status: In(['pending', 'confirmed', 'completed', 'checked_in', 'in_progress', 'awaiting_payment']),
      },
    });

    // 3. Collect booked times (hỗ trợ block theo duration)
    const bookedSlots = new Set<string>();
    for (const appt of appointments) {
      if (!appt.appointment_time) continue;
      const startStr = appt.appointment_time.slice(0, 5); // "HH:mm"
      
      let [sH, sM] = startStr.split(':').map(Number);
      const startTotal = sH * 60 + sM;
      
      let endTotal = startTotal + 30; // Chỉ lock 30 phút cho bác sĩ

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
      // Check if this schedule is already full
      const scheduleAppointments = appointments.filter(a => a.schedule_id === schedule.id);
      if (scheduleAppointments.length >= schedule.max_patients) {
        continue; // Skip this schedule, it's full
      }

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
      relations: ['doctors', 'hospitals', 'hospitals.doctors']
    });

    if (!servicePackage) {
      return [];
    }

    let doctorsToCheck = servicePackage.doctors || [];
    if (doctorsToCheck.length === 0 && servicePackage.hospitals && servicePackage.hospitals.length > 0) {
      doctorsToCheck = servicePackage.hospitals.flatMap(h => h.doctors || []);
    }

    if (doctorsToCheck.length === 0) {
      return [];
    }

    const durationMinutes = servicePackage.duration_minutes || 30;
    const allAvailableSlots = new Set<string>();

    for (const doctor of doctorsToCheck) {
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

        const conflictEndH = Math.floor((totalStartMins + 30) / 60);
        const conflictEndM = (totalStartMins + 30) % 60;
        const conflictEndTimeStr = `${String(conflictEndH).padStart(2, '0')}:${String(conflictEndM).padStart(2, '0')}`;

        const overlapConflict = await this.dataSource.manager
          .createQueryBuilder(Appointment, 'appt')
          .where('appt.doctor_id = :doctorId', { doctorId: doctor.id })
          .andWhere('appt.appointment_date = :appointmentDate', { appointmentDate: date })
          .andWhere('appt.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'completed', 'checked_in', 'in_progress', 'awaiting_payment'] })
          .andWhere('appt.appointment_time < :newEndTime', { newEndTime: conflictEndTimeStr })
          .andWhere("ADDTIME(appt.appointment_time, '00:30:00') > :newStartTime", { newStartTime: time })
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
      relations: ['categories', 'doctors', 'doctors.user', 'doctors.category', 'hospitals', 'hospitals.doctors', 'hospitals.doctors.user', 'hospitals.doctors.category']
    });

    if (!servicePackage) {
      return [];
    }

    let doctorsToCheck = servicePackage.doctors || [];
    if (doctorsToCheck.length === 0 && servicePackage.hospitals && servicePackage.hospitals.length > 0) {
      // Fallback to all doctors in the hospital(s)
      doctorsToCheck = servicePackage.hospitals.flatMap(h => h.doctors || []);
      
      // Filter by package categories if applicable
      if (servicePackage.categories && servicePackage.categories.length > 0) {
        const packageCategoryIds = servicePackage.categories.map(c => c.id);
        doctorsToCheck = doctorsToCheck.filter(d => d.category && packageCategoryIds.includes(d.category.id));
      }
    }

    if (doctorsToCheck.length === 0) {
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

    for (const doctor of doctorsToCheck) {
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
        .andWhere("COALESCE(appt.end_time, ADDTIME(appt.appointment_time, '00:30:00')) > :newStartTime", { newStartTime: time })
        .getCount();

      if (overlapConflict === 0) {
        // Find which hospital this doctor belongs to that is also in the package
        let matchedHospitalId: number | null = null;
        if (doctor.hospitals && doctor.hospitals.length > 0) {
          // If the package has hospitals, try to find intersection
          if (servicePackage.hospitals && servicePackage.hospitals.length > 0) {
            const intersection = doctor.hospitals.find(h => servicePackage.hospitals.some(sh => sh.id === h.id));
            if (intersection) {
              matchedHospitalId = intersection.id;
            } else {
              matchedHospitalId = doctor.hospitals[0].id;
            }
          } else {
            matchedHospitalId = doctor.hospitals[0].id;
          }
        }

        // Map to include name and avatar for frontend convenience
        availableDoctors.push({
          ...doctor,
          name: doctor.user?.full_name || 'Bác sĩ ẩn danh',
          avatar_url: doctor.user?.avatar_url || '',
          specialty: doctor.category?.name || '',
          hospital_id: matchedHospitalId
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
      where: [
        {
          status: 'pending',
          created_at: LessThan(expirationTime),
          reschedule_count: 0, // Đơn mới chưa thanh toán
        },
        {
          status: 'awaiting_payment',
          updated_at: LessThan(expirationTime), // Đơn dời lịch lần 2 chưa thanh toán
        }
      ],
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

  async requestRefund(
    appointmentId: number,
    user: any,
    bankInfo?: { bankName?: string; bankAccount?: string; accountName?: string }
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
      throw new BadRequestException('Chỉ có thể yêu cầu hoàn tiền cho lịch hẹn đã bị hủy');
    }

    if (appointment.refund_status !== 'none') {
      throw new BadRequestException('Lịch hẹn này đã có yêu cầu hoàn tiền trước đó');
    }

    appointment.refund_status = 'requested';
    if (bankInfo) {
      if (bankInfo.bankName) appointment.refund_bank_name = bankInfo.bankName;
      if (bankInfo.bankAccount) appointment.refund_bank_account = bankInfo.bankAccount;
      if (bankInfo.accountName) appointment.refund_account_name = bankInfo.accountName;
    }

    // Đảm bảo có refund_amount
    if (!appointment.refund_amount || appointment.refund_amount == 0) {
      appointment.refund_amount = appointment.total_fee;
    }
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

    if (!['cancelled', 'rejected', 'pending', 'confirmed'].includes(appointment.status)) {
      throw new BadRequestException('Chỉ có thể dời lịch cho lịch hẹn hợp lệ');
    }

    if (appointment.refund_status === 'requested' || appointment.refund_status === 'completed') {
      throw new BadRequestException('Lịch hẹn này đã có yêu cầu hoàn tiền, không thể dời lịch');
    }

    if (!appointment.doctor_id) {
      throw new BadRequestException('Lịch hẹn gốc không có thông tin bác sĩ');
    }

    // Verify same specialty
    const oldDoctor = await this.doctorsRepository.findOne({
      where: { id: appointment.doctor_id },
      relations: ['category'],
    });

    const newDoctor = await this.doctorsRepository.findOne({
      where: { id: dto.doctor_id },
      relations: ['category'],
    });

    if (!oldDoctor || !newDoctor) {
      throw new BadRequestException('Không tìm thấy thông tin bác sĩ');
    }

    if (oldDoctor.category?.id !== newDoctor.category?.id) {
      throw new BadRequestException('Bác sĩ được chọn không cùng chuyên khoa với bác sĩ ban đầu');
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
        status: In(['pending', 'confirmed', 'checked_in', 'completed']),
      },
    });

    if (existingAppointmentsCount >= newSchedule.max_patients) {
      throw new BadRequestException('Ca làm việc đã đầy, vui lòng chọn ca khác');
    }

    // Update appointment with new schedule info
    appointment.doctor_id = dto.doctor_id;
    appointment.hospital_id = dto.hospital_id;
    appointment.schedule_id = dto.schedule_id;
    appointment.appointment_date = dto.appointment_date as any;
    appointment.appointment_time = dto.appointment_time;

    const currentCount = appointment.reschedule_count || 0;

    if (!appointment.appointment_date || !appointment.appointment_time) {
      throw new BadRequestException('Lịch hẹn gốc không có thông tin ngày giờ hợp lệ');
    }

    // Tính thời gian của lịch khám gốc
    const appointmentDateStr = typeof appointment.appointment_date === 'string'
      ? appointment.appointment_date
      : appointment.appointment_date.toISOString().split('T')[0];
    // Đảm bảo có đủ HH:mm:ss hoặc HH:mm
    const timeStr = appointment.appointment_time.length === 5 ? `${appointment.appointment_time}:00` : appointment.appointment_time;
    const originalAppointmentDateTime = new Date(`${appointmentDateStr}T${timeStr}`);
    const now = new Date();

    // Tính khoảng cách thời gian (giờ)
    const diffHours = (originalAppointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (appointment.admin_cancelled_free_reschedule) {
      // Dời lịch miễn phí do lỗi từ viện
      appointment.status = 'pending';
      appointment.admin_cancelled_free_reschedule = false; // Dùng xong cờ này thì xóa
    } else {
      // Nếu dời lịch sát giờ (dưới 1 tiếng) hoặc đã dời >= 1 lần thì phải thanh toán
      if (currentCount >= 1 || diffHours < 1) {
        appointment.status = 'awaiting_payment';
      } else {
        appointment.status = 'pending';
      }
      appointment.reschedule_count = currentCount + 1;
    }
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
