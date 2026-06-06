import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Like } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Category } from 'src/categories/entities/category.entity';
import { City } from 'src/cities/entities/city.entity';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalsRepository: Repository<Hospital>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: any): Promise<Hospital> {
    const { categoryIds, city_id, city, ...rest } = dto;
    const hospital = this.hospitalsRepository.create({
      ...rest,
    } as Partial<Hospital>);

    if (city_id) {
      hospital.city = { id: city_id } as any;
    } else if (city && typeof city === 'string') {
      let foundCity = await this.categoriesRepository.manager.findOne(City, { where: { name: city } });
      if (!foundCity) {
        foundCity = await this.categoriesRepository.manager.save(City, { name: city });
      }
      hospital.city = foundCity;
    }

    if (categoryIds?.length) {
      hospital.categories = await this.categoriesRepository.find({
        where: { id: In(categoryIds) },
      });
    }

    return this.hospitalsRepository.save(hospital);
  }

  findAll(city?: string): Promise<Hospital[]> {
    const whereClause: any = {};
    if (city) {
      whereClause.city = { name: Like(`%${city}%`) };
    }
    return this.hospitalsRepository.find({
      where: whereClause,
      relations: ['categories', 'city'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Hospital> {
    const hospital = await this.hospitalsRepository.findOne({
      where: { id },
      relations: ['categories', 'city'],
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    return hospital;
  }

  async update(id: number, dto: any): Promise<Hospital> {
    const { categoryIds, city_id, city, ...rest } = dto;
    const hospital = await this.findOne(id);
    Object.assign(hospital, rest);
    
    if (city_id) {
      hospital.city = { id: city_id } as any;
    } else if (city && typeof city === 'string') {
      let foundCity = await this.categoriesRepository.manager.findOne(City, { where: { name: city } });
      if (!foundCity) {
        foundCity = await this.categoriesRepository.manager.save(City, { name: city });
      }
      hospital.city = foundCity;
    }

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
