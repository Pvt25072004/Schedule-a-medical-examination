import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Check if email already exists
    const existingDoctor = await this.doctorsRepository.findOne({
      where: { email: createDoctorDto.email },
    });

    if (existingDoctor) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Check if phone already exists
    const existingPhone = await this.doctorsRepository.findOne({
      where: { phone: createDoctorDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    const doctor = this.doctorsRepository.create(createDoctorDto);
    return await this.doctorsRepository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      relations: ['hospitals', 'schedules'],
      where: { is_active: true },
    });
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['hospitals', 'schedules', 'appointments'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor với ID ${id} không tồn tại`);
    }

    return doctor;
  }

  async findBySpecialty(specialty: string): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      where: { specialty, is_active: true },
      relations: ['hospitals'],
    });
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    // Check email conflict
    if (updateDoctorDto.email && updateDoctorDto.email !== doctor.email) {
      const existingDoctor = await this.doctorsRepository.findOne({
        where: { email: updateDoctorDto.email },
      });

      if (existingDoctor) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Check phone conflict
    if (updateDoctorDto.phone && updateDoctorDto.phone !== doctor.phone) {
      const existingPhone = await this.doctorsRepository.findOne({
        where: { phone: updateDoctorDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    Object.assign(doctor, updateDoctorDto);
    return await this.doctorsRepository.save(doctor);
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorsRepository.remove(doctor);
  }
}
