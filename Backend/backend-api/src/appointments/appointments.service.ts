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
    // Tìm schedule dựa vào schedule_id (nếu có) hoặc tìm theo doctor_id, date, time
    let schedule: Schedule | null = null;
    
    if (createAppointmentDto.schedule_id) {
      schedule = await this.schedulesRepository.findOne({
        where: { id: createAppointmentDto.schedule_id },
      });
    } else {
      // Nếu không có schedule_id, tìm schedule dựa vào doctor_id, date, time
      // Format date string để so sánh chính xác (YYYY-MM-DD)
      const appointmentDateStr = createAppointmentDto.appointment_date.slice(0, 10);
      const appointmentTime = createAppointmentDto.appointment_time;
      
      const allSchedules = await this.schedulesRepository.find({
        where: {
          doctor_id: createAppointmentDto.doctor_id,
        },
      });

      // Lọc schedules theo date và tìm schedule có time slot chứa appointment_time
      for (const sch of allSchedules) {
        const schDateStr = sch.work_date instanceof Date
          ? sch.work_date.toISOString().slice(0, 10)
          : String(sch.work_date).slice(0, 10);
        
        if (schDateStr === appointmentDateStr) {
          const start = sch.start_time.slice(0, 5); // HH:mm
          const end = sch.end_time.slice(0, 5);
          if (appointmentTime >= start && appointmentTime <= end) {
            schedule = sch;
            break;
          }
        }
      }
    }

    // Nếu tìm thấy schedule, kiểm tra capacity
    if (schedule) {
      // Đếm số appointments đã có trong schedule này với cùng date và time
      // Chỉ đếm các appointment có status pending hoặc confirmed (chưa bị hủy/từ chối)
      const appointmentDate = new Date(createAppointmentDto.appointment_date);
      const existingAppointments = await this.appointmentsRepository.count({
        where: {
          schedule_id: schedule.id,
          appointment_date: appointmentDate,
          appointment_time: createAppointmentDto.appointment_time,
          status: In(['pending', 'confirmed']),
        },
      });

      // Kiểm tra capacity
      if (existingAppointments >= schedule.max_patients) {
        throw new BadRequestException(
          `Ca làm việc này đã đầy (tối đa ${schedule.max_patients} bệnh nhân)`,
        );
      }

      // Đảm bảo schedule_id được set đúng
      createAppointmentDto.schedule_id = schedule.id;
    }

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
