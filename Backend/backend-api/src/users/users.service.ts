import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser: User | null = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Check if phone already exists
    const existingPhone: User | null = await this.usersRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: [
        'id',
        'full_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'avatar_url',
        'created_at',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['appointments'],
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { phone },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check email conflict if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser: User | null = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Check phone conflict if phone is being updated
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingPhone: User | null = await this.usersRepository.findOne({
        where: { phone: updateUserDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
