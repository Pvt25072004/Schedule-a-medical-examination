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

  async findAll(page: number = 1, limit: number = 100, userCtx?: any, filters?: { role?: string; status?: string; search?: string; region?: string }): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const qb = this.usersRepository.createQueryBuilder('user')
      .where('user.role != :adminRole', { adminRole: 'admin' })
      .orderBy('user.id', 'DESC');

    if (filters?.role && filters.role !== 'all') {
      qb.andWhere('user.role = :roleFilter', { roleFilter: filters.role });
    }

    if (filters?.status && filters.status !== 'all') {
      qb.andWhere('user.is_active = :isActive', { isActive: filters.status === 'active' });
    }

    if (filters?.search) {
      qb.andWhere('(user.full_name LIKE :search OR user.email LIKE :search OR user.phone LIKE :search OR user.address LIKE :search)', { search: `%${filters.search}%` });
    }

    if (filters?.region && filters.region !== 'all') {
      qb.andWhere('user.address LIKE :region', { region: `%${filters.region}%` });
    }

    if (userCtx?.role === 'admin_hospital') {
      if (!userCtx.hospital_id) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      qb.andWhere(subQuery => {
        const sq = subQuery.subQuery()
          .select('1')
          .from('appointments', 'a')
          .where('a.user_id = user.id')
          .andWhere('a.hospital_id = :hospitalId')
          .getQuery();
        return `EXISTS ${sq}`;
      }).setParameter('hospitalId', userCtx.hospital_id);
    }

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

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      relations: ['hospital', 'hospital.categories']
    });
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

    // 1. Xóa ảnh trên Cloudinary (nếu có lỗi DB thì ảnh vẫn bị xóa trên mây, nhưng rủi ro này chấp nhận được)
    if (user.avatar_public_id) {
      await this.cloudinaryService.deleteImage(user.avatar_public_id);
    }
    if (user.id_card_front_public_id) {
      await this.cloudinaryService.deleteImage(user.id_card_front_public_id);
    }
    if (user.id_card_back_public_id) {
      await this.cloudinaryService.deleteImage(user.id_card_back_public_id);
    }

    // Thực thi Xóa trong Transaction để tránh sinh ra dữ liệu rác nếu lỡ sập giữa chừng
    await this.usersRepository.manager.transaction(async (transactionalEntityManager) => {
      let appointmentIds: number[] = [];

      const doctorRows = await transactionalEntityManager.query('SELECT id FROM doctors WHERE user_id = ?', [id]);
      const doctorId = doctorRows.length > 0 ? doctorRows[0].id : null;

      if (doctorId) {
        const appts = await transactionalEntityManager.query('SELECT id FROM appointments WHERE doctor_id = ?', [doctorId]);
        appointmentIds.push(...appts.map((a: any) => a.id));
      }

      const patientAppts = await transactionalEntityManager.query('SELECT id FROM appointments WHERE user_id = ?', [id]);
      appointmentIds.push(...patientAppts.map((a: any) => a.id));

      appointmentIds = [...new Set(appointmentIds)];

      if (appointmentIds.length > 0) {
        const idsString = appointmentIds.join(',');
        await transactionalEntityManager.query(`DELETE FROM payments WHERE appointment_id IN (${idsString})`);
        await transactionalEntityManager.query(`DELETE FROM reviews WHERE appointment_id IN (${idsString})`);
        await transactionalEntityManager.query(`DELETE FROM appointments WHERE id IN (${idsString})`);
      }

      if (doctorId) {
        await transactionalEntityManager.query('DELETE FROM reviews WHERE doctor_id = ?', [doctorId]);
        await transactionalEntityManager.query('DELETE FROM schedules WHERE doctor_id = ?', [doctorId]);
        await transactionalEntityManager.query('DELETE FROM doctor_applications WHERE doctor_id = ?', [doctorId]);
        await transactionalEntityManager.query('DELETE FROM banners WHERE doctor_id = ?', [doctorId]);
        await transactionalEntityManager.query('DELETE FROM doctor_hospital WHERE doctor_id = ?', [doctorId]); // Xóa bảng join
        await transactionalEntityManager.query('DELETE FROM doctors WHERE id = ?', [doctorId]);
      }

      await transactionalEntityManager.query('DELETE FROM reviews WHERE user_id = ?', [id]);
      await transactionalEntityManager.query('DELETE FROM likes WHERE user_id = ?', [id]);
      await transactionalEntityManager.query('DELETE FROM comments WHERE user_id = ?', [id]);

      // Cuối cùng xóa User
      await transactionalEntityManager.remove(user);
    });
  }
}
