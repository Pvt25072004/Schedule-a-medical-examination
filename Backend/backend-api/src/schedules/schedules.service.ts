import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Check for time conflicts
    const workDate = new Date(createScheduleDto.work_date);
    const doctorId: number = createScheduleDto.doctor_id;
    const hospitalId: number = createScheduleDto.hospital_id;
    const conflict: Schedule | null = await this.schedulesRepository.findOne({
      where: {
        doctor_id: doctorId,
        hospital_id: hospitalId,
        work_date: workDate,
        is_available: true,
      },
    });

    if (conflict) {
      // Check if times overlap
      const newStart = this.timeToMinutes(createScheduleDto.start_time);
      const newEnd = this.timeToMinutes(createScheduleDto.end_time);
      const conflictStart = this.timeToMinutes(conflict.start_time);
      const conflictEnd = this.timeToMinutes(conflict.end_time);

      if (
        (newStart >= conflictStart && newStart < conflictEnd) ||
        (newEnd > conflictStart && newEnd <= conflictEnd) ||
        (newStart <= conflictStart && newEnd >= conflictEnd)
      ) {
        throw new BadRequestException(
          'Lịch làm việc bị trùng với lịch hiện có',
        );
      }
    }

    // Validate start_time < end_time
    if (
      this.timeToMinutes(createScheduleDto.start_time) >=
      this.timeToMinutes(createScheduleDto.end_time)
    ) {
      throw new BadRequestException(
        'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
      );
    }

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      work_date: new Date(createScheduleDto.work_date),
      max_patients: createScheduleDto.max_patients || 10,
      is_available: createScheduleDto.is_available ?? true,
    });

    return await this.schedulesRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return await this.schedulesRepository.find({
      relations: ['doctor', 'hospital'],
      where: { is_available: true },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['doctor', 'hospital'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule với ID ${id} không tồn tại`);
    }

    return schedule;
  }

  async findAvailableDoctors(
    specialtyId: number,
    date: string,
    requestedTime: string,
  ): Promise<number[]> {
    const availableDoctorsQuery = this.schedulesRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.doctor', 'doctor')
      .innerJoin('doctor.specialties', 'specialty', 'specialty.id = :specialtyId', { specialtyId })
      
      .andWhere('schedule.work_date = :date', { date })
      .andWhere('schedule.start_time <= :requestedTime', { requestedTime })
      .andWhere('schedule.end_time >= :requestedTime', { requestedTime })
      
      .leftJoin(Appointment, 'appointment', 
        'appointment.doctor_id = schedule.doctor_id AND appointment.appointment_date = :date AND appointment.appointment_time = :requestedTime AND (appointment.status = :statusConfirmed OR appointment.status = :statusPending)',
        { date, requestedTime, statusConfirmed: 'confirmed', statusPending: 'pending' } // Kiểm tra cả confirmed và pending
      )
      .andWhere('appointment.id IS NULL') // Chỉ lấy những lịch không có cuộc hẹn trùng,
      .select('doctor.id', 'doctorId')
      .distinct(true)
      .getRawMany();

    const doctorIds = (await availableDoctorsQuery).map(result => result.doctorId);
    
    return doctorIds;
  }

  async findByDoctorAndDate(doctorId: number, date: Date): Promise<Schedule[]> {
    return await this.schedulesRepository.find({
      where: {
        doctor_id: doctorId,
        work_date: date,
        is_available: true,
      },
      relations: ['hospital'],
    });
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);

    // Check for conflicts if updating time
    if (updateScheduleDto.start_time || updateScheduleDto.end_time) {
      const startTime = updateScheduleDto.start_time || schedule.start_time;
      const endTime = updateScheduleDto.end_time || schedule.end_time;

      if (this.timeToMinutes(startTime) >= this.timeToMinutes(endTime)) {
        throw new BadRequestException(
          'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
        );
      }
    }

    Object.assign(schedule, {
      ...updateScheduleDto,
      work_date: updateScheduleDto.work_date
        ? new Date(updateScheduleDto.work_date)
        : schedule.work_date,
    });

    return await this.schedulesRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.schedulesRepository.remove(schedule);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
