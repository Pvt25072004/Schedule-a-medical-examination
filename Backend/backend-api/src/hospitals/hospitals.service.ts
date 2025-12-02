import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalsRepository: Repository<Hospital>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateHospitalDto): Promise<Hospital> {
    const { categoryIds, ...rest } = dto;
    const hospital = this.hospitalsRepository.create(rest as Partial<Hospital>);

    if (categoryIds?.length) {
      hospital.categories = await this.categoriesRepository.find({
        where: { id: In(categoryIds) },
      });
    }

    return this.hospitalsRepository.save(hospital);
  }

  findAll(): Promise<Hospital[]> {
    return this.hospitalsRepository.find({
      relations: ['categories'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Hospital> {
    const hospital = await this.hospitalsRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    return hospital;
  }

  async update(id: number, dto: UpdateHospitalDto): Promise<Hospital> {
    const { categoryIds, ...rest } = dto;
    const hospital = await this.findOne(id);
    Object.assign(hospital, rest);

    if (categoryIds) {
      hospital.categories = categoryIds.length
        ? await this.categoriesRepository.find({
            where: { id: In(categoryIds) },
          })
        : [];
    }

    return this.hospitalsRepository.save(hospital);
  }

  async remove(id: number): Promise<void> {
    const hospital = await this.findOne(id);
    await this.hospitalsRepository.remove(hospital);
  }
}
