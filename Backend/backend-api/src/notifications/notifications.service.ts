import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(dto);
    return await this.notificationsRepository.save(notification);
  }

  async findByUser(userId: number, page: number = 1, limit: number = 20): Promise<Notification[]> {
    const skip = (page - 1) * limit;
    return await this.notificationsRepository.find({
      where: [
        { user_id: userId },
        { user_id: null as any }, // global system announcements
      ],
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    });
  }

  async findAllSystem(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { user_id: null as any },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (notification) {
      notification.is_read = true;
      return await this.notificationsRepository.save(notification);
    }
    throw new Error(`Notification #${id} not found`);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }
}
