import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
  ) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    // Check if email already exists
    const existingHospital = await this.hospitalsRepository.findOne({
      where: { email: createHospitalDto.email },
    });

    if (existingHospital) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hospital = this.hospitalsRepository.create(createHospitalDto);
    return await this.hospitalsRepository.save(hospital);
  }

  async findAll(): Promise<Hospital[]> {
    return await this.hospitalsRepository.find({
      relations: ['doctors'],
      where: { is_active: true },
    });
  }

  async findOne(id: number): Promise<Hospital> {
    const hospital = await this.hospitalsRepository.findOne({
      where: { id },
      relations: ['doctors', 'appointments'],
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital với ID ${id} không tồn tại`);
    }

    return hospital;
  }

  async update(
    id: number,
    updateHospitalDto: UpdateHospitalDto,
  ): Promise<Hospital> {
    const hospital = await this.findOne(id);

    // Check email conflict
    if (updateHospitalDto.email && updateHospitalDto.email !== hospital.email) {
      const existingHospital = await this.hospitalsRepository.findOne({
        where: { email: updateHospitalDto.email },
      });

      if (existingHospital) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    Object.assign(hospital, updateHospitalDto);
    return await this.hospitalsRepository.save(hospital);
  }

  async remove(id: number): Promise<void> {
    const hospital = await this.findOne(id);
    await this.hospitalsRepository.remove(hospital);
  }

  async findByArea(areaId: number): Promise<Hospital[]> {
    return this.hospitalsRepository.find({
      where: { area_id: areaId, is_active: true },
      order: { name: 'ASC' },
    });
  }
}
