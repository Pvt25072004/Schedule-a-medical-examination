import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { SchedulesService } from '../schedules/schedules.service';
import { Schedule } from '../schedules/entities/schedule.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,

    @Inject(forwardRef(() => SchedulesService))
    private schedulesService: SchedulesService,
  ) { }

  /** Tạo lịch hẹn mới */
  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    // 1. Lấy schedule
    const schedule: Schedule = await this.schedulesService.findOne(dto.schedule_id);
    if (!schedule || !schedule.is_available) {
      throw new BadRequestException('Lịch làm việc không khả dụng');
    }

    const appointmentDate = new Date(dto.appointment_date);
    const scheduleDate = new Date(schedule.work_date);

    // 2. Kiểm tra ngày
    if (appointmentDate.toDateString() !== scheduleDate.toDateString()) {
      throw new BadRequestException('Ngày hẹn không khớp với lịch làm việc');
    }

    // 3. Kiểm tra thời gian
    const appointmentTime = this.timeToMinutes(dto.appointment_time);
    const scheduleStart = this.timeToMinutes(schedule.start_time);
    const scheduleEnd = this.timeToMinutes(schedule.end_time);
    if (appointmentTime < scheduleStart || appointmentTime >= scheduleEnd) {
      throw new BadRequestException('Thời gian hẹn ngoài khung giờ làm việc');
    }

    // 4. Kiểm tra slot còn trống
    const bookedCount = await this.countByScheduleAndDate(schedule.id, appointmentDate);
    if (bookedCount >= schedule.max_patients) {
      throw new BadRequestException('Lịch hẹn đã đầy');
    }

    // 5. Kiểm tra user đã có lịch cùng giờ chưa
    const existing = await this.appointmentsRepository.findOne({
      where: {
        user_id: dto.user_id,
        appointment_date: appointmentDate,
        appointment_time: dto.appointment_time,
        status: 'pending',
      },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã có lịch hẹn vào thời gian này');
    }

    // 6. Tạo appointment
    const appointment = this.appointmentsRepository.create({
      ...dto,
      appointment_date: appointmentDate,
      status: 'pending',
    });
    return await this.appointmentsRepository.save(appointment);
  }

  /** Lấy tất cả lịch hẹn */
  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: ['user', 'doctor', 'hospital', 'payment'],
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'doctor', 'hospital', 'payment'],
    });
    if (!appointment) throw new NotFoundException('Lịch hẹn không tồn tại');
    return appointment;
  }

  async findByUser(userId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { user_id: userId },
      relations: ['doctor', 'hospital', 'payment'],
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { doctor_id: doctorId },
      relations: ['user', 'hospital', 'payment'],
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  /** Count booked slot theo schedule và ngày */
  async countByScheduleAndDate(scheduleId: number, date: Date): Promise<number> {
    return this.appointmentsRepository.count({
      where: { schedule_id: scheduleId, appointment_date: date, status: 'pending' },
    });
  }

  /** Cập nhật appointment */
  async update(id: number, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw new BadRequestException('Không thể cập nhật lịch đã hoàn thành/hủy');
    }

    Object.assign(appointment, {
      ...dto,
      appointment_date: dto.appointment_date ? new Date(dto.appointment_date) : appointment.appointment_date,
    });
    return this.appointmentsRepository.save(appointment);
  }

  /** Cập nhật trạng thái */
  async updateStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    return this.appointmentsRepository.save(appointment);
  }

  /** Xóa appointment */
  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    if (appointment.status === 'completed') {
      throw new BadRequestException('Không thể xóa lịch đã hoàn thành');
    }
    await this.appointmentsRepository.remove(appointment);
  }

  /** Utils: convert time string "HH:MM" -> phút */
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
