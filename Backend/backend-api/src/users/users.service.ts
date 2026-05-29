import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) { }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findByProvider(
    auth_provider: string,
    provider_id: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { auth_provider, provider_id },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password) {
      createUserDto.password_hash = await bcrypt.hash(createUserDto.password, 10);
      delete createUserDto.password;
    }
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new ConflictException(`User with ID ${id} not found`);
    }

    // if (dto.email && dto.email !== user.email) {
    //   const exists = await this.usersRepository.findOne({
    //     where: { email: dto.email },
    //   });
    //   if (exists) throw new ConflictException('Email đã được sử dụng');
    // }

    // if (dto.phone && dto.phone !== user.phone) {
    //   const exists = await this.usersRepository.findOne({
    //     where: { phone: dto.phone },
    //   });
    //   if (exists) throw new ConflictException('Số điện thoại đã được sử dụng');
    // }

    const oldAvatarPublicId = user.avatar_public_id;
    const oldFrontPublicId = user.id_card_front_public_id;
    const oldBackPublicId = user.id_card_back_public_id;

    if (dto.password) {
      dto.password_hash = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }

    Object.assign(user, dto);
    const savedUser = await this.usersRepository.save(user);

    if (
      dto.avatar_public_id &&
      oldAvatarPublicId &&
      oldAvatarPublicId !== dto.avatar_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldAvatarPublicId);
    }

    if (
      dto.id_card_front_public_id &&
      oldFrontPublicId &&
      oldFrontPublicId !== dto.id_card_front_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldFrontPublicId);
    }

    if (
      dto.id_card_back_public_id &&
      oldBackPublicId &&
      oldBackPublicId !== dto.id_card_back_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldBackPublicId);
    }

    return savedUser;
  }

  async remove(id: number): Promise<void> {
    const user = (await this.findOne(id)) as User;

    if (user.avatar_public_id) {
      await this.cloudinaryService.deleteImage(user.avatar_public_id);
    }
    if (user.id_card_front_public_id) {
      await this.cloudinaryService.deleteImage(user.id_card_front_public_id);
    }
    if (user.id_card_back_public_id) {
      await this.cloudinaryService.deleteImage(user.id_card_back_public_id);
    }

    await this.usersRepository.remove(user);
  }
}
