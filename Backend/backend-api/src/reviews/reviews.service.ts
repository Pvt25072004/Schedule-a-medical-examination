import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: createReviewDto.appointment_id },
    });
    if (!appointment) {
      throw new NotFoundException(
        `Appointment #${createReviewDto.appointment_id} not found`,
      );
    }
    if (appointment.status !== 'completed') {
      throw new BadRequestException(
        'Chỉ được đánh giá sau khi lịch hẹn đã hoàn thành',
      );
    }
    if (
      appointment.user_id !== createReviewDto.user_id ||
      appointment.doctor_id !== createReviewDto.doctor_id
    ) {
      throw new BadRequestException(
        'Thông tin user_id / doctor_id không khớp với appointment',
      );
    }

    const review = this.reviewsRepository.create(createReviewDto);
    return this.reviewsRepository.save(review);
  }

  findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['appointment', 'user', 'doctor'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['appointment', 'user', 'doctor'],
    });
    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateReviewDto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }

  async findByDoctor(doctorId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { doctor_id: doctorId },
      order: { created_at: 'DESC' },
      relations: ['user', 'appointment'],
    });
  }
}
