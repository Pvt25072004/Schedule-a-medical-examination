import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

  async create(dto: CreateScheduleDto, user?: any): Promise<Schedule> {
    if (user?.role === 'admin_hospital' && dto.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền tạo lịch cho bệnh viện khác');
    }
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

    const schedule = this.schedulesRepository.create({
      ...dto,
      is_available: false, // Force false until approved
      approval_status: 'pending', // Force pending
    });
    return this.schedulesRepository.save(schedule);
  }

  async approve(id: number, user?: any): Promise<Schedule> {
    const schedule = await this.findOne(id);
    if (user?.role === 'admin_hospital' && schedule.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái lịch của cơ sở khác');
    }
    schedule.is_available = true;
    schedule.approval_status = 'approved';
    return this.schedulesRepository.save(schedule);
  }

  findAll(user?: any): Promise<Schedule[]> {
    if (user?.role === 'admin_hospital') {
      return this.schedulesRepository.find({
        where: { hospital_id: user.hospital_id },
        order: { work_date: 'ASC', start_time: 'ASC' },
      });
    }
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
  async findByDoctor(doctorId: number, user?: any): Promise<Schedule[]> {
    const where: any = { doctor_id: doctorId };
    if (user?.role === 'admin_hospital') {
      where.hospital_id = user.hospital_id;
    }
    return this.schedulesRepository.find({
      where,
      relations: ['hospital'],
      order: {
        work_date: 'ASC',
        start_time: 'ASC',
      },
    });
  }
  async update(id: number, dto: UpdateScheduleDto, user?: any): Promise<Schedule> {
    const schedule = await this.findOne(id);
    if (user?.role === 'admin_hospital' && schedule.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền sửa đổi lịch của cơ sở khác');
    }
    Object.assign(schedule, dto);
    return this.schedulesRepository.save(schedule);
  }

  async remove(id: number, user?: any): Promise<void> {
    const schedule = await this.findOne(id);
    if (user?.role === 'admin_hospital' && schedule.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền xóa lịch của cơ sở khác');
    }
    await this.schedulesRepository.remove(schedule);
  }
}
