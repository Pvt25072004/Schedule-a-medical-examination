import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { In, Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { SpecialtiesService } from 'src/specialties/specialties.service';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    private specialtiesService: SpecialtiesService,
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

    if (createDoctorDto.specialties && createDoctorDto.specialties.length > 0) {
      const specialtyIds = createDoctorDto.specialties.map(s => s.id);

      const specialties = await this.specialtiesService.findByIds(specialtyIds);

      doctor.specialties = specialties;
    }

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

  async findByIds(doctorIds: number[]): Promise<Doctor[]> {
    if (doctorIds.length === 0) {
      return [];
    }
    return await this.doctorsRepository.find({
      where: { id: In(doctorIds), is_active: true },
      relations: ['hospitals', 'specialties'],
    });
  }

  async findBySpecialtyId(specialtyId: number): Promise<Doctor[]> {
    return await this.doctorsRepository
      .createQueryBuilder('doctor')
      .innerJoin('doctor.specialties', 'specialty', 'specialty.id = :specialtyId', { specialtyId })
      .andWhere('doctor.is_active = true')
      .select(['doctor.id', 'doctor.name', 'doctor.email', 'doctor.phone', 'doctor.avatar_url'])
      .getMany();
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
