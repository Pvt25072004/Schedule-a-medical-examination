import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import * as bcrypt from 'bcrypt';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
    private usersService: UsersService,
  ) {}

  findAll(): Promise<Doctor[]> {
    return this.doctorsRepository.find({
      relations: ['category', 'hospitals'],
    });
  }

  findOne(id: number): Promise<Doctor | null> {
    return this.doctorsRepository.findOne({
      where: { id },
      relations: ['category', 'hospitals'],
    });
  }

  findByEmail(email: string): Promise<Doctor | null> {
    return this.doctorsRepository.findOne({
      where: { email },
      relations: ['category', 'hospitals'],
    });
  }

  async createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    const existingByPhone = await this.usersService.findByPhone(dto.phone);

    if (existingByEmail || existingByPhone) {
      throw new ConflictException('Email hoặc số điện thoại đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(String(dto.password), 10);

    // Tạo user với role doctor để đăng nhập chung hệ thống
    const user = await this.usersService.create({
      full_name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password_hash: passwordHash,
      gender: 'other',
      role: 'doctor',
      is_active: true,
    });

    if (!user?.id) {
      throw new ConflictException('Không thể tạo tài khoản user cho bác sĩ');
    }

    const doctorData: Partial<Doctor> = {
      name: dto.name,
      specialty: dto.specialty,
      email: dto.email,
      phone: dto.phone,
      password_hash: passwordHash,
      description: dto.description ?? '',
      is_active: true,
    };

    const doctor = this.doctorsRepository.create(doctorData);

    if (dto.category_id) {
      // Chỉ cần set id cho quan hệ, TypeORM sẽ hiểu đây là Category liên kết
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (doctor as Doctor).category = {
        id: dto.category_id,
      } as Category;
    }

    return this.doctorsRepository.save(doctor);
  }

  async toggleActive(id: number): Promise<Doctor> {
    const doctor = await this.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    doctor.is_active = !doctor.is_active;
    const saved = await this.doctorsRepository.save(doctor);

    // Đồng bộ trạng thái với bảng users (login)
    const user = await this.usersService.findByEmail(doctor.email);
    if (user) {
      await this.usersService.update(user.id, {
        is_active: doctor.is_active,
      } as any);
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    await this.doctorsRepository.remove(doctor);
  }

  async updateProfileByEmail(
    email: string,
    dto: UpdateDoctorProfileDto,
  ): Promise<Doctor> {
    const doctor = await this.findByEmail(email);
    if (!doctor) {
      throw new NotFoundException(`Doctor with email ${email} not found`);
    }

    if (dto.name !== undefined) {
      doctor.name = dto.name;
    }
    if (dto.specialty !== undefined) {
      doctor.specialty = dto.specialty;
    }
    if (dto.avatar_url !== undefined) {
      doctor.avatar_url = dto.avatar_url;
    }
    if (dto.description !== undefined) {
      doctor.description = dto.description;
    }
    if (dto.category_id) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (doctor as Doctor).category = {
        id: dto.category_id,
      } as Category;
    }

    if (
      Array.isArray(dto.hospitalIds) &&
      (dto.hospitalIds as number[]).length > 0
    ) {
      const hospitals = await this.hospitalsRepository.find({
        where: { id: In(dto.hospitalIds as number[]) },
      });
      doctor.hospitals = hospitals;
    }

    return this.doctorsRepository.save(doctor);
  }
}
