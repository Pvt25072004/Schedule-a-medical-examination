import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Repository, MoreThanOrEqual, In } from 'typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
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

    const appointment =
      this.appointmentsRepository.create(createAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find();
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOneBy({ id });
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
      relations: ['doctor', 'hospital'],
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
    return this.appointmentsRepository.save(appointment);
  }
}
