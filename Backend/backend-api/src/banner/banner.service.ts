import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Doctor } from 'src/doctors/doctor.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(dto: CreateBannerDto): Promise<Banner> {
    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.category_id },
      });

      if (!category) {
        throw new NotFoundException(
          `Không tìm thấy chuyên khoa với ID ${dto.category_id}`,
        );
      }
    }

    if (dto.doctor_id) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: dto.doctor_id },
      });

      if (!doctor) {
        throw new NotFoundException(
          `Không tìm thấy bác sĩ với ID ${dto.doctor_id}`,
        );
      }
    }

    if (
      dto.start_date &&
      dto.end_date &&
      new Date(dto.start_date) > new Date(dto.end_date)
    ) {
      throw new BadRequestException('start_date không được lớn hơn end_date');
    }

    const banner = this.bannerRepository.create({
      ...dto,
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
    });

    return await this.bannerRepository.save(banner);
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepository.find({
      relations: ['category', 'doctor'],
      order: {
        priority: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async findActive(): Promise<Banner[]> {
    const now = new Date();

    return this.bannerRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.category', 'category')
      .leftJoinAndSelect('banner.doctor', 'doctor')
      .where('banner.is_active = :isActive', { isActive: true })
      .andWhere('(banner.start_date IS NULL OR banner.start_date <= :now)', {
        now,
      })
      .andWhere('(banner.end_date IS NULL OR banner.end_date >= :now)', {
        now,
      })
      .orderBy('banner.priority', 'DESC')
      .addOrderBy('banner.created_at', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['category', 'doctor'],
    });

    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID ${id}`);
    }

    return banner;
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);

    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.category_id },
      });

      if (!category) {
        throw new NotFoundException(
          `Không tìm thấy chuyên khoa với ID ${dto.category_id}`,
        );
      }
    }

    if (dto.doctor_id) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: dto.doctor_id },
      });

      if (!doctor) {
        throw new NotFoundException(
          `Không tìm thấy bác sĩ với ID ${dto.doctor_id}`,
        );
      }
    }

    if (
      dto.start_date &&
      dto.end_date &&
      new Date(dto.start_date) > new Date(dto.end_date)
    ) {
      throw new BadRequestException('start_date không được lớn hơn end_date');
    }

    Object.assign(banner, {
      ...dto,
      start_date: dto.start_date ? new Date(dto.start_date) : banner.start_date,
      end_date: dto.end_date ? new Date(dto.end_date) : banner.end_date,
    });

    return this.bannerRepository.save(banner);
  }

  async remove(id: number): Promise<{ message: string }> {
    const banner = await this.findOne(id);

    await this.bannerRepository.remove(banner);

    return {
      message: `Xóa banner ID ${id} thành công`,
    };
  }
}
