import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { AppointmentsService } from '../appointments/appointments.service';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private appointmentsService: AppointmentsService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Check if appointment exists and is completed
    const appointmentId = createReviewDto.appointment_id as number;
    const findOnePromise: Promise<Appointment> =
      this.appointmentsService.findOne(appointmentId);
    const appointment: Appointment = await findOnePromise;

    if (appointment.status !== 'completed') {
      throw new BadRequestException(
        'Chỉ có thể đánh giá lịch hẹn đã hoàn thành',
      );
    }

    // Check if review already exists for this appointment
    const reviewAppointmentId = createReviewDto.appointment_id as number;
    const existingReview: Review | null = await this.reviewsRepository.findOne({
      where: { appointment_id: reviewAppointmentId },
    });

    if (existingReview) {
      throw new BadRequestException('Đánh giá cho lịch hẹn này đã tồn tại');
    }

    // Verify user_id matches appointment user_id
    if (appointment.user_id !== createReviewDto.user_id) {
      throw new BadRequestException(
        'Không thể đánh giá lịch hẹn của người khác',
      );
    }

    // Verify doctor_id matches appointment doctor_id
    if (appointment.doctor_id !== createReviewDto.doctor_id) {
      throw new BadRequestException('Doctor ID không khớp với lịch hẹn');
    }

    const review = this.reviewsRepository.create(createReviewDto);
    return await this.reviewsRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewsRepository.find({
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
      throw new NotFoundException(`Review với ID ${id} không tồn tại`);
    }

    return review;
  }

  async findByDoctor(doctorId: number): Promise<Review[]> {
    return await this.reviewsRepository.find({
      where: { doctor_id: doctorId },
      relations: ['appointment', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByAppointment(appointmentId: number): Promise<Review | null> {
    return await this.reviewsRepository.findOne({
      where: { appointment_id: appointmentId },
      relations: ['user', 'doctor'],
    });
  }

  async getDoctorAverageRating(doctorId: number): Promise<number> {
    const result: { average: string | number | null } | undefined =
      await this.reviewsRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .where('review.doctor_id = :doctorId', { doctorId })
        .getRawOne();

    return result?.average ? parseFloat(String(result.average)) : 0;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateReviewDto);
    return await this.reviewsRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }
}
