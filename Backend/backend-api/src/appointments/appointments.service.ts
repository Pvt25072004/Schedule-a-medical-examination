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
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return await this.dataSource.transaction(async (manager) => {
      const appointmentDateStr = createAppointmentDto.appointment_date.slice(
        0,
        10,
      );
      console.log(createAppointmentDto);
      const appointmentTime = createAppointmentDto.appointment_time;

      // 1. Validate ngày quá khứ
      const appointmentDate = dayjs(appointmentDateStr, 'YYYY-MM-DD').startOf(
        'day',
      );
      const today = dayjs().startOf('day');

      if (appointmentDate.isBefore(today)) {
        throw new BadRequestException('Không thể đặt lịch trong quá khứ!');
      }

      let schedule: Schedule | null;

      // 2. Tìm schedule + lock
      if (createAppointmentDto.schedule_id) {
        schedule = await manager.findOne(Schedule, {
          where: {
            id: createAppointmentDto.schedule_id,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });
      } else {
        schedule = await manager
          .createQueryBuilder(Schedule, 'schedule')
          .setLock('pessimistic_write')
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
          .andWhere('schedule.end_time > :appointmentTime', {
            appointmentTime,
          })
          .getOne();
      }

      // 3. Không tìm thấy schedule
      if (!schedule) {
        throw new BadRequestException('Không tìm thấy lịch làm việc phù hợp!');
      }

      // 4. Kiểm tra trạng thái ca
      if (!schedule.is_available) {
        throw new BadRequestException('Ca khám hiện không khả dụng!');
      }

      // 5. Kiểm tra duplicate booking
      const existedAppointment = await manager.findOne(Appointment, {
        where: {
          user_id: createAppointmentDto.user_id,
          schedule_id: schedule.id,
          status: In(['pending', 'confirmed']),
        },
      });

      if (existedAppointment) {
        throw new BadRequestException('Bạn đã đặt lịch trong ca khám này rồi!');
      }

      // 6. Đếm số lượng bệnh nhân hiện tại
      const existingAppointmentsCount = await manager.count(Appointment, {
        where: {
          schedule_id: schedule.id,
          status: In(['pending', 'confirmed']),
        },
      });

      // 7. Kiểm tra capacity
      if (existingAppointmentsCount >= schedule.max_patients) {
        throw new BadRequestException(
          `Ca khám đã đầy (${schedule.max_patients} bệnh nhân)!`,
        );
      }

      // 8. Gán lại schedule_id chính xác
      createAppointmentDto.schedule_id = schedule.id;

      // 9. Tạo appointment
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
