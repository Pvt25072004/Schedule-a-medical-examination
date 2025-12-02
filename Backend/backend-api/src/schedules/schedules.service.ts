import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  create(dto: CreateScheduleDto): Promise<Schedule> {
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

  async findByDoctor(doctorId: number): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: { doctor_id: doctorId },
      order: { work_date: 'ASC', start_time: 'ASC' },
      relations: ['hospital'],
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
