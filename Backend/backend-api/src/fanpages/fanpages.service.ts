import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fanpage } from './entities/fanpage.entity';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';
import { Hospital } from 'src/hospitals/entities/hospital.entity';

@Injectable()
export class FanpagesService {
  constructor(
    @InjectRepository(Fanpage)
    private readonly fanpageRepository: Repository<Fanpage>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
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
      relations: ['hospital', 'posts'],
    });

    if (!fanpage) {
      throw new NotFoundException('Không tìm thấy Fanpage');
    }

    return fanpage;
  }

  async findByHospitalId(hospital_id: number): Promise<Fanpage> {
    const fanpage = await this.fanpageRepository.findOne({
      where: { hospital_id },
      relations: ['hospital', 'posts'],
    });

    if (!fanpage) {
      throw new NotFoundException('Bệnh viện này chưa có Fanpage');
    }

    return fanpage;
  }

  async update(id: number, updateFanpageDto: UpdateFanpageDto): Promise<Fanpage> {
    const fanpage = await this.findOne(id);
    const updated = Object.assign(fanpage, updateFanpageDto);
    return this.fanpageRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const fanpage = await this.findOne(id);
    await this.fanpageRepository.remove(fanpage);
  }
}
