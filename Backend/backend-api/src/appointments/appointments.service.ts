import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Repository, MoreThanOrEqual, In, DataSource } from 'typeorm';
import dayjs from 'dayjs';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    private dataSource: DataSource,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return await this.dataSource.transaction(async (manager) => {
      const appointmentDateStr = createAppointmentDto.appointment_date.slice(
        0,
        10,
      );

      const appointmentTime =
        createAppointmentDto.appointment_time.length === 5
          ? `${createAppointmentDto.appointment_time}:00`
          : createAppointmentDto.appointment_time;

      // validate ngày
      const appointmentDate = dayjs(appointmentDateStr, 'YYYY-MM-DD').startOf(
        'day',
      );

      const today = dayjs().startOf('day');

      if (appointmentDate.isBefore(today)) {
        throw new BadRequestException('Ngày hẹn không được phép trong quá khứ');
      }

      // BẮT BUỘC phải có schedule_id
      if (!createAppointmentDto.schedule_id) {
        throw new BadRequestException('Không tìm thấy lịch làm việc phù hợp!');
      }

      // tìm schedule
      const schedule = await manager.findOne(Schedule, {
        where: {
          id: createAppointmentDto.schedule_id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!schedule) {
        throw new BadRequestException('Không tìm thấy lịch làm việc phù hợp!');
      }

      // validate doctor
      if (schedule.doctor_id !== createAppointmentDto.doctor_id) {
        throw new BadRequestException('Bác sĩ không hợp lệ!');
      }

      // validate hospital
      if (schedule.hospital_id !== createAppointmentDto.hospital_id) {
        throw new BadRequestException('Bệnh viện không hợp lệ!');
      }

      // validate ngày
      const scheduleDate = dayjs(schedule.work_date).format('YYYY-MM-DD');

      if (scheduleDate !== appointmentDateStr) {
        throw new BadRequestException('Ngày khám không đúng lịch làm việc!');
      }

      // validate giờ
      if (
        !(
          appointmentTime >= schedule.start_time &&
          appointmentTime < schedule.end_time
        )
      ) {
        throw new BadRequestException('Giờ khám không nằm trong ca làm việc!');
      }

      // unavailable
      if (!schedule.is_available) {
        throw new BadRequestException('Ca khám hiện không khả dụng!');
      }

      // duplicate booking
      const existedAppointment = await manager.findOne(Appointment, {
        where: {
          user_id: createAppointmentDto.user_id,
          schedule_id: schedule.id,
          appointment_date: appointmentDateStr as any,
          appointment_time: appointmentTime,
          status: In(['pending', 'confirmed']),
        },
      });

      if (existedAppointment) {
        throw new BadRequestException('Bạn đã đặt lịch trong ca khám này rồi!');
      }

      // count slot
      const existingAppointmentsCount = await manager.count(Appointment, {
        where: {
          schedule_id: schedule.id,
          appointment_date: appointmentDateStr as any,
          appointment_time: appointmentTime,
          status: In(['pending', 'confirmed']),
        },
      });

      if (existingAppointmentsCount >= schedule.max_patients) {
        throw new BadRequestException(
          `Ca khám đã đầy (${schedule.max_patients} bệnh nhân)!`,
        );
      }

      createAppointmentDto.appointment_time = appointmentTime;

      const appointment = manager.create(Appointment, createAppointmentDto);

      return await manager.save(appointment);
    });
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
