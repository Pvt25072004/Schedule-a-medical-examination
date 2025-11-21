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
import { PaymentsService } from '../payments/payments.service';
import { Schedule } from '../schedules/entities/schedule.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @Inject(forwardRef(() => SchedulesService))
    private schedulesService: SchedulesService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // 1. Check if schedule exists and is available
    const scheduleId = createAppointmentDto.schedule_id as number;
    const findSchedulePromise: Promise<Schedule> =
      this.schedulesService.findOne(scheduleId);
    const schedule: Schedule = await findSchedulePromise;

    if (!schedule.is_available) {
      throw new BadRequestException('Lịch làm việc không khả dụng');
    }

    // 2. Check if appointment date matches schedule date
    const appointmentDateString =
      createAppointmentDto.appointment_date as string;
    const appointmentDate = new Date(appointmentDateString);
    const scheduleDateValue = schedule.work_date as Date | string;
    const scheduleDate = new Date(scheduleDateValue);

    if (appointmentDate.toDateString() !== scheduleDate.toDateString()) {
      throw new BadRequestException(
        'Ngày hẹn không khớp với lịch làm việc của bác sĩ',
      );
    }

    // 3. Check if appointment time is within schedule time
    const appointmentTime = this.timeToMinutes(
      createAppointmentDto.appointment_time,
    );
    const scheduleStart = this.timeToMinutes(schedule.start_time);
    const scheduleEnd = this.timeToMinutes(schedule.end_time);

    if (appointmentTime < scheduleStart || appointmentTime >= scheduleEnd) {
      throw new BadRequestException(
        'Thời gian hẹn không nằm trong khung giờ làm việc',
      );
    }

    // 4. Check available slots
    const bookedCount = await this.countByScheduleAndDate(
      schedule.id,
      appointmentDate,
    );

    if (bookedCount >= schedule.max_patients) {
      throw new BadRequestException('Lịch hẹn đã đầy');
    }

    // 5. Check if user already has appointment at this time
    const userId = createAppointmentDto.user_id as number;
    const appointmentTimeString =
      createAppointmentDto.appointment_time as string;
    const existingAppointment: Appointment | null =
      await this.appointmentsRepository.findOne({
        where: {
          user_id: userId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTimeString,
          status: 'pending',
        },
      });

    if (existingAppointment) {
      throw new BadRequestException('Bạn đã có lịch hẹn vào thời gian này');
    }

    // 6. Create appointment
    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      appointment_date: appointmentDate,
      status: 'pending',
    });

    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    return savedAppointment;
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      relations: ['user', 'doctor', 'hospital', 'payment'],
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'doctor', 'hospital', 'payment'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment với ID ${id} không tồn tại`);
    }

    return appointment;
  }

  async findByUser(userId: number): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { user_id: userId },
      relations: ['doctor', 'hospital', 'payment'],
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { doctor_id: doctorId },
      relations: ['user', 'hospital', 'payment'],
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  async countByScheduleAndDate(
    scheduleId: number,
    date: Date,
  ): Promise<number> {
    // Count appointments for the same schedule, date, and time slot
    // Note: This is a simplified version - in real scenario, you'd need to
    // match appointments with the same schedule_id, date, and time
    const statusValue: string = 'pending';
    return await this.appointmentsRepository.count({
      where: {
        appointment_date: date,
        status: statusValue,
      },
    });
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Don't allow updating if already completed or cancelled
    if (
      appointment.status === 'completed' ||
      appointment.status === 'cancelled'
    ) {
      throw new BadRequestException(
        'Không thể cập nhật lịch hẹn đã hoàn thành hoặc đã hủy',
      );
    }

    Object.assign(appointment, {
      ...updateAppointmentDto,
      appointment_date: updateAppointmentDto.appointment_date
        ? new Date(updateAppointmentDto.appointment_date)
        : appointment.appointment_date,
    });

    return await this.appointmentsRepository.save(appointment);
  }

  async updateStatus(
    id: number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected',
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);

    // Check if appointment can be cancelled
    if (appointment.status === 'completed') {
      throw new BadRequestException('Không thể xóa lịch hẹn đã hoàn thành');
    }

    await this.appointmentsRepository.remove(appointment);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
