import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fanpage } from './entities/fanpage.entity';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FanpagesService {
  constructor(
    @InjectRepository(Fanpage)
    private readonly fanpageRepository: Repository<Fanpage>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createFanpageDto: CreateFanpageDto): Promise<Fanpage> {
    const hospital = await this.hospitalRepository.findOne({
      where: { id: createFanpageDto.hospital_id },
    });

    if (!hospital) {
      throw new NotFoundException('Không tìm thấy bệnh viện');
    }

    const existingFanpage = await this.fanpageRepository.findOne({
      where: { hospital_id: createFanpageDto.hospital_id },
    });

    if (existingFanpage) {
      throw new ConflictException('Bệnh viện này đã có Fanpage');
    }

    const fanpage = this.fanpageRepository.create(createFanpageDto);
    return this.fanpageRepository.save(fanpage);
  }

  async findAll(): Promise<Fanpage[]> {
    return this.fanpageRepository.find({
      relations: ['hospital'],
    });
  }

  async findOne(id: number): Promise<Fanpage> {
    const fanpage = await this.fanpageRepository.findOne({
      where: { id },
      relations: ['hospital'],
    });

    if (!fanpage) {
      throw new NotFoundException('Không tìm thấy Fanpage');
    }

    return fanpage;
  }

  async findByHospitalId(hospital_id: number): Promise<Fanpage> {
    let fanpage = await this.fanpageRepository.findOne({
      where: { hospital_id },
      relations: ['hospital'],
    });

    if (!fanpage) {
      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospital_id },
      });

      if (!hospital) {
        throw new NotFoundException('Không tìm thấy Bệnh viện');
      }

      const newFanpage = this.fanpageRepository.create({
        hospital_id,
      });

      fanpage = await this.fanpageRepository.save(newFanpage);
      fanpage.hospital = hospital;
    }

    return fanpage;
  }

  async update(id: number, updateFanpageDto: UpdateFanpageDto): Promise<Fanpage> {
    const fanpage = await this.findOne(id);
    
    const oldAvatarPublicId = fanpage.avatar_public_id;
    const oldCoverPublicId = fanpage.cover_public_id;

    const updated = Object.assign(fanpage, updateFanpageDto);
    const saved = await this.fanpageRepository.save(updated);

    if (
      updateFanpageDto.avatar_public_id &&
      oldAvatarPublicId &&
      oldAvatarPublicId !== updateFanpageDto.avatar_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldAvatarPublicId);
    }

    if (
      updateFanpageDto.cover_public_id &&
      oldCoverPublicId &&
      oldCoverPublicId !== updateFanpageDto.cover_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldCoverPublicId);
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const fanpage = await this.findOne(id);
    
    if (fanpage.avatar_public_id) {
      await this.cloudinaryService.deleteImage(fanpage.avatar_public_id);
    }
    
    if (fanpage.cover_public_id) {
      await this.cloudinaryService.deleteImage(fanpage.cover_public_id);
    }

    await this.fanpageRepository.remove(fanpage);
  }
}
