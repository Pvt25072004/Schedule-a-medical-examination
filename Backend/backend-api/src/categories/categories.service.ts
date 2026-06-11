import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');

    const category = this.categoriesRepository.create({
      ...dto,
      slug,
    });
    return this.categoriesRepository.save(category);
  }

  findAll(hospitalId?: number): Promise<Category[]> {
    const qb = this.categoriesRepository.createQueryBuilder('category');
    if (hospitalId) {
      qb.innerJoin('hospital_category', 'hc', 'hc.category_id = category.id')
        .where('hc.hospital_id = :hospitalId', { hospitalId });
    }
    qb.orderBy('category.name', 'ASC');
    return qb.getMany();
  }

  async findAllPaginated(page: number, limit: number, hospitalId?: number): Promise<any> {
    const qb = this.categoriesRepository.createQueryBuilder('category');
    if (hospitalId) {
      qb.innerJoin('hospital_category', 'hc', 'hc.category_id = category.id')
        .where('hc.hospital_id = :hospitalId', { hospitalId });
    }
    qb.orderBy('category.name', 'ASC');
    
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }
}
