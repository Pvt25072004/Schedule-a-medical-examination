import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { PricingService } from '../pricing/pricing.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';

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
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    let schedule: Schedule | null = null;
    const appointmentDateStr = createAppointmentDto.appointment_date.slice(0, 10); // YYYY-MM-DD
    const appointmentTime = createAppointmentDto.appointment_time; // Đã được DTO validate format HH:mm

    // 1. Tìm kiếm lịch làm việc (Schedule)
    if (createAppointmentDto.schedule_id) {
      schedule = await this.schedulesRepository.findOne({
        where: { id: createAppointmentDto.schedule_id },
      });
    } else {
      // KHẮC PHỤC: Dùng QueryBuilder để truy vấn trực tiếp trên DB thay vì tải hết lên RAM
      schedule = await this.schedulesRepository
        .createQueryBuilder('schedule')
        .where('schedule.doctor_id = :doctorId', {
          doctorId: createAppointmentDto.doctor_id,
        })
        .andWhere('schedule.hospital_id = :hospitalId', {
          hospitalId: createAppointmentDto.hospital_id,
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

    // 2. Kiểm tra sự tồn tại của lịch làm việc
    if (!schedule) {
      throw new BadRequestException(
        'Không tìm thấy lịch làm việc phù hợp của bác sĩ vào thời gian đã chọn!',
      );
    }

    // 3. KHẮC PHỤC: Bổ sung kiểm tra trạng thái sẵn sàng (is_available) của ca khám
    if (!schedule.is_available) {
      throw new BadRequestException(
        'Ca làm việc này của bác sĩ hiện đã tạm ngưng hoặc không khả dụng. Vui lòng chọn ca khác!',
      );
    }

    // 4. KHẮC PHỤC: Tính tổng số bệnh nhân đã đặt trong CẢ CA LÀM VIỆC (Bỏ filter trùng giờ chi tiết)
    // Chỉ đếm các appointment có status pending hoặc confirmed (chưa bị hủy/từ chối)
    const existingAppointmentsCount = await this.appointmentsRepository.count({
      where: {
        schedule_id: schedule.id,
        status: In(['pending', 'confirmed']),
      },
    });

    // 5. Kiểm tra giới hạn tải (Capacity)
    if (existingAppointmentsCount >= schedule.max_patients) {
      throw new BadRequestException(
        `Ca làm việc này đã đầy bệnh nhân (tối đa ${schedule.max_patients} người/ca). Vui lòng chọn ca khám khác!`,
      );
    }

    // Cập nhật lại chính xác schedule_id trước khi tạo bản ghi
    createAppointmentDto.schedule_id = schedule.id;

    // --- Lấy dữ liệu Bác sĩ & Bệnh viện để thực hiện Snapshot giá và thông tin (Chuẩn Enterprise) ---
    const [doctor, hospital] = await Promise.all([
      this.doctorsRepository.findOneBy({ id: createAppointmentDto.doctor_id }),
      this.hospitalsRepository.findOneBy({ id: createAppointmentDto.hospital_id }),
    ]);

    if (!doctor || !hospital) {
      throw new BadRequestException('Thông tin bác sĩ hoặc bệnh viện không hợp lệ!');
    }

    // Tính toán giá bằng Stateless PricingService (Pure Function Style)
    const pricing = this.pricingService.calculateAppointmentFee(doctor, hospital);

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      doctor_fee_snapshot: pricing.doctorFeeSnapshot,
      hospital_fee_snapshot: pricing.hospitalFeeSnapshot,
      total_fee: pricing.totalFee,
      doctor_name_snapshot: pricing.doctorNameSnapshot,
      hospital_name_snapshot: pricing.hospitalNameSnapshot,
      currency_snapshot: pricing.currencySnapshot,
    });

    const saved = await this.appointmentsRepository.save(appointment);

    // Lưu thông báo in-app
    try {
      await this.notificationsService.create({
        user_id: saved.user_id,
        title: '🎉 Đặt lịch hẹn khám thành công!',
        body: `Lịch khám của bạn với bác sĩ ${saved.doctor_name_snapshot || ''} tại ${saved.hospital_name_snapshot || ''} vào lúc ${saved.appointment_time} ngày ${saved.appointment_date} đã được ghi nhận và đang chờ xác nhận.`,
        type: 'appointment_pending',
      });
    } catch (err) {
      console.error('🔥 Lỗi tạo thông báo in-app (đặt lịch):', err);
    }

    return saved;
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find();
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
  ): Promise<Appointment> {
    const appointment = (await this.findOne(id)) as Appointment;
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: number) {
    const appointment = (await this.findOne(id)) as Appointment;
    return this.appointmentsRepository.remove(appointment);
  }

  async findByDoctor(
    doctorId: number,
    date?: string,
  ): Promise<Appointment[]> {
    const where: any = { doctor_id: doctorId };
    if (date) {
      where.appointment_date = date;
    } else {
      // mặc định lấy từ hôm nay trở đi
      where.appointment_date = MoreThanOrEqual(new Date().toISOString().slice(0, 10));
    }

    return this.appointmentsRepository.find({
      where,
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['user', 'hospital'],
    });
  }

  async findByUser(userId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { user_id: userId },
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['doctor', 'hospital', 'review'],
    });
  }

  async updateStatus(
    id: number,
    status: string,
    reason?: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new Error(`Appointment #${id} not found`);
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
}
