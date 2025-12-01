import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    const area = this.areasRepository.create(createAreaDto);
    return await this.areasRepository.save(area);
  }

  findAll(): Promise<Area[]> {
    return this.areasRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Area> {
    const area = await this.areasRepository.findOneBy({ id });
    if (!area) throw new NotFoundException("Area not found");
    return area;
  }

  update(id: number, updateAreaDto: UpdateAreaDto) {
    return `This action updates a #${id} area`;
  }

  remove(id: number) {
    return `This action removes a #${id} area`;
  }
}
