import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) { }

  async create(dto: CreateScheduleDto, user?: any): Promise<any> {
    if (user?.role === 'admin_hospital' && dto.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền tạo lịch cho bệnh viện khác');
    }

    const startDate = new Date(dto.work_date);
    const endDate = dto.end_date ? new Date(dto.end_date) : new Date(dto.work_date);

    if (endDate < startDate) {
      throw new BadRequestException('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
    }

    let doctorsToProcess: Doctor[] = [];

    if (dto.apply_to_all_doctors) {
      let qb = this.doctorsRepository
        .createQueryBuilder('doctor')
        .innerJoin('doctor.hospitals', 'hospital')
        .leftJoinAndSelect('doctor.user', 'user')
        .where('hospital.id = :hospitalId', { hospitalId: dto.hospital_id })
        .andWhere('doctor.verification_status = :status', { status: 'active' });

      if (dto.category_id) {
        qb = qb.andWhere('doctor.category_id = :categoryId', { categoryId: dto.category_id });
      }

      doctorsToProcess = await qb.getMany();

      if (doctorsToProcess.length === 0) {
        throw new BadRequestException(
          dto.category_id 
            ? 'Không có bác sĩ nào thuộc chuyên khoa này đang hoạt động tại cơ sở.' 
            : 'Không có bác sĩ nào đang hoạt động tại cơ sở này.'
        );
      }
    } else {
      if (!dto.doctor_id) {
        throw new BadRequestException('Vui lòng cung cấp doctor_id hoặc chọn apply_to_all_doctors');
      }
      const doctor = await this.doctorsRepository.findOne({
        where: { id: dto.doctor_id },
        relations: ['user']
      });
      if (!doctor) {
        throw new BadRequestException('Không tìm thấy bác sĩ');
      }
      doctorsToProcess.push(doctor);
    }

    let successCount = 0;
    const failed: any[] = [];

    // Loop through each date
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const workDateStr = currentDate.toISOString().slice(0, 10);

      for (const doctor of doctorsToProcess) {
        const conflicting = await this.schedulesRepository
          .createQueryBuilder('s')
          .where('s.doctor_id = :doctorId', { doctorId: doctor.id })
          .andWhere('DATE(s.work_date) = :workDate', { workDate: workDateStr })
          .andWhere('s.start_time < :endTime', { endTime: dto.end_time })
          .andWhere('s.end_time > :startTime', { startTime: dto.start_time })
          .getOne();

        if (conflicting) {
          failed.push({
            date: workDateStr,
            doctor_id: doctor.id,
            doctor_name: doctor.user?.full_name || 'Không rõ',
            reason: `Trùng lịch từ ${conflicting.start_time} – ${conflicting.end_time}`,
          });
          continue;
        }

        const isCreatedByAdmin = user?.role === 'admin' || user?.role === 'admin_hospital';
        const schedule = this.schedulesRepository.create({
          ...dto,
          work_date: workDateStr, // overwrite work_date with current date in loop
          doctor_id: doctor.id,
          is_available: isCreatedByAdmin ? true : false,
          approval_status: isCreatedByAdmin ? 'approved' : 'pending',
        });
        await this.schedulesRepository.save(schedule);
        successCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      message: `Đã tạo thành công ${successCount} ca làm việc.`,
      success_count: successCount,
      failed_count: failed.length,
      failed,
    };
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
        relations: ['doctor', 'doctor.user', 'hospital'],
      });
    }
    return this.schedulesRepository.find({
      order: { work_date: 'ASC', start_time: 'ASC' },
      relations: ['doctor', 'doctor.user', 'hospital'],
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

  async updateStatus(id: number, is_available: boolean, user?: any): Promise<Schedule> {
    const schedule = await this.findOne(id);
    if (user?.role === 'admin_hospital' && schedule.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái lịch của cơ sở khác');
    }
    schedule.is_available = is_available;
    return this.schedulesRepository.save(schedule);
  }
}
