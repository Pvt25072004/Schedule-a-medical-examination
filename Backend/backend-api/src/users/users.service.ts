import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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

  async create(createUserDto: CreateUserDto): Promise<User> {
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

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = (await this.findOne(id)) as User;
    await this.usersRepository.remove(user);
  }
}
