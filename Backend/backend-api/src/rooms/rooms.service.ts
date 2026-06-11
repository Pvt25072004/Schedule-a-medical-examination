import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const existing = await this.roomsRepository.findOne({
      where: { name: createRoomDto.name, hospital_id: createRoomDto.hospital_id }
    });
    if (existing) {
      throw new ConflictException(`Phòng khám "${createRoomDto.name}" đã tồn tại trong cơ sở này.`);
    }
    const room = this.roomsRepository.create(createRoomDto);
    return this.roomsRepository.save(room);
  }

  async createBulk(createRoomDtos: CreateRoomDto[]): Promise<Room[]> {
    const validDtos: CreateRoomDto[] = [];
    for (const dto of createRoomDtos) {
      const existing = await this.roomsRepository.findOne({
        where: { name: dto.name, hospital_id: dto.hospital_id }
      });
      if (!existing) {
        validDtos.push(dto);
      }
    }
    
    if (validDtos.length === 0) {
      throw new ConflictException("Tất cả các phòng khám bạn yêu cầu tạo đều đã tồn tại.");
    }
    
    const rooms = this.roomsRepository.create(validDtos);
    return this.roomsRepository.save(rooms);
  }

  findAll(hospitalId?: number, categoryId?: number): Promise<Room[]> {
    const where: any = {};
    if (hospitalId) where.hospital_id = hospitalId;
    if (categoryId) where.category_id = categoryId;

    return this.roomsRepository.find({
      where,
      relations: ['hospital', 'category'],
      order: { name: 'ASC' },
    });
  }

  async findAllPaginated(page: number, limit: number, hospitalId?: number, categoryId?: number): Promise<any> {
    const where: any = {};
    if (hospitalId) where.hospital_id = hospitalId;
    if (categoryId) where.category_id = categoryId;

    const [data, total] = await this.roomsRepository.findAndCount({
      where,
      relations: ['hospital', 'category'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['hospital', 'category'],
    });
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);

    if (updateRoomDto.name) {
      const hospitalIdToCheck = updateRoomDto.hospital_id || room.hospital_id;
      const existing = await this.roomsRepository.findOne({
        where: { name: updateRoomDto.name, hospital_id: hospitalIdToCheck }
      });
      
      if (existing && existing.id !== id) {
        throw new ConflictException(`Phòng khám "${updateRoomDto.name}" đã tồn tại trong cơ sở này.`);
      }
    }

    Object.assign(room, updateRoomDto);
    return this.roomsRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomsRepository.remove(room);
  }
}
