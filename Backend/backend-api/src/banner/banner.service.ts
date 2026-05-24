import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}
  // async create(dto: CreateBannerDto, hospitalId: number): Promise<Banner> {
  //   if (dto.doctor_id) {
  //     const doctor = await this.doctorRepository.findOne({
  //       where: {
  //         id: dto.doctor_id,
  //       },
  //       relations: ['hospitals'],
  //     });

  //     if (!doctor) {
  //       throw new NotFoundException('Không tìm thấy bác sĩ');
  //     }

  //     const belongsToHospital = doctor.hospitals.some(
  //       (hospital) => hospital.id === hospitalId,
  //     );

  //     if (!belongsToHospital) {
  //       throw new BadRequestException(
  //         'Bác sĩ này không thuộc bệnh viện của bạn',
  //       );
  //     }
  //   }

  //   const banner = this.bannerRepository.create({
  //     ...dto,
  //     hospital_id: hospitalId,
  //     start_date: dto.start_date ? new Date(dto.start_date) : null,
  //     end_date: dto.end_date ? new Date(dto.end_date) : null,
  //   });

  //   return this.bannerRepository.save(banner);
  // }
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
  async findByHospital(hospitalId: number): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: {
        hospital_id: hospitalId,
      },
      relations: ['hospital', 'category', 'doctor'],
      order: {
        priority: 'DESC',
        created_at: 'DESC',
      },
    });
  }
  // async update(
  //   id: number,
  //   dto: UpdateBannerDto,
  //   hospitalId: number,
  // ): Promise<Banner> {
  //   const banner = await this.bannerRepository.findOne({
  //     where: {
  //       id,
  //       hospital_id: hospitalId,
  //     },
  //   });

  //   if (!banner) {
  //     throw new NotFoundException(
  //       'Không tìm thấy banner hoặc bạn không có quyền sửa',
  //     );
  //   }

  //   Object.assign(banner, {
  //     ...dto,
  //     start_date: dto.start_date ? new Date(dto.start_date) : banner.start_date,
  //     end_date: dto.end_date ? new Date(dto.end_date) : banner.end_date,
  //   });

  //   return this.bannerRepository.save(banner);
  // }

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

    const oldImagePublicId = banner.image_public_id;

    Object.assign(banner, {
      ...dto,
      start_date: dto.start_date ? new Date(dto.start_date) : banner.start_date,
      end_date: dto.end_date ? new Date(dto.end_date) : banner.end_date,
    });

    const savedBanner = await this.bannerRepository.save(banner);

    if (
      dto.image_public_id &&
      oldImagePublicId &&
      oldImagePublicId !== dto.image_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldImagePublicId);
    }

    return savedBanner;
  }

  async remove(id: number): Promise<{ message: string }> {
    const banner = await this.findOne(id);

    if (banner.image_public_id) {
      await this.cloudinaryService.deleteImage(banner.image_public_id);
    }

    await this.bannerRepository.remove(banner);

    return {
      message: `Xóa banner ID ${id} thành công`,
    };
  }
}
