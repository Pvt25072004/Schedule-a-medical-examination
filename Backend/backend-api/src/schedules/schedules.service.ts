import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
  ) { }

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    // Kiểm tra xung đột lịch: bác sĩ không được có 2 lịch trùng giờ trong cùng 1 ngày
    // dù ở bệnh viện khác nhau (bác sĩ không thể phân thân!)
    const workDate = String(dto.work_date).slice(0, 10);
    const conflicting = await this.schedulesRepository
      .createQueryBuilder('s')
      .where('s.doctor_id = :doctorId', { doctorId: dto.doctor_id })
      .andWhere('DATE(s.work_date) = :workDate', { workDate })
      .andWhere('s.start_time < :endTime', { endTime: dto.end_time })
      .andWhere('s.end_time > :startTime', { startTime: dto.start_time })
      .getOne();

    if (conflicting) {
      throw new BadRequestException(
        `Bác sĩ đã có lịch làm việc trùng giờ vào ngày ${workDate} ` +
        `(${conflicting.start_time} – ${conflicting.end_time}) ` +
        `tại bệnh viện #${conflicting.hospital_id}. ` +
        `Vui lòng chọn khung giờ khác hoặc ngày khác!`,
      );
    }

    const schedule = this.schedulesRepository.create(dto);
    return this.schedulesRepository.save(schedule);
  }

  findAll(): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      order: { work_date: 'ASC', start_time: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  // async findByDoctor(doctorId: number): Promise<Schedule[]> {
  //   return this.schedulesRepository.find({
  //     where: { doctor_id: doctorId },
  //     order: { work_date: 'ASC', start_time: 'ASC' },
  //     relations: ['hospital'],
  //   });
  // }
  async findByDoctor(doctorId: number): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: {
        doctor_id: doctorId,
      },
      relations: ['hospital'],
      order: {
        work_date: 'ASC',
        start_time: 'ASC',
      },
    });
  }
  async update(id: number, dto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, dto);
    return this.schedulesRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.schedulesRepository.remove(schedule);
  }
}
