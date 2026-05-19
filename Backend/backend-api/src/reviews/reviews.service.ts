import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,

    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    // Kiểm tra xem lịch hẹn này đã được đánh giá trước đó chưa
    const existing = await this.reviewsRepository.findOne({
      where: { appointment_id: dto.appointment_id },
    });

    if (existing) {
      throw new BadRequestException('Lịch hẹn này đã được đánh giá rồi!');
    }

    // 1. Tạo bản ghi Đánh giá mới
    const review = this.reviewsRepository.create(dto);
    const savedReview = await this.reviewsRepository.save(review);

    // 2. Tải thông tin Bác sĩ để tính toán lại Rating
    const doctor = await this.doctorsRepository.findOne({
      where: { id: dto.doctor_id },
    });

    if (doctor) {
      const currentRating = doctor.rating || 5.0;
      const currentCount = doctor.review_count || 0;

      const newCount = currentCount + 1;
      // Tính trung bình cộng mới
      const totalStars = (currentRating * currentCount) + dto.rating;
      const newAvgRating = totalStars / newCount;

      // Làm tròn 1 chữ số thập phân
      doctor.rating = Math.round(newAvgRating * 10) / 10;
      doctor.review_count = newCount;

      await this.doctorsRepository.save(doctor);
    } else {
      throw new NotFoundException(`Không tìm thấy bác sĩ với ID ${dto.doctor_id}`);
    }

    return savedReview;
  }

  async findByDoctor(doctorId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { doctor_id: doctorId },
      relations: ['user'], // Kèm thông tin Bệnh nhân gửi đánh giá
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID ${id}`);
    }

    const ratingChanged = dto.rating && dto.rating !== review.rating;
    
    Object.assign(review, dto);
    const savedReview = await this.reviewsRepository.save(review);

    if (ratingChanged) {
      const doctor = await this.doctorsRepository.findOne({ where: { id: review.doctor_id } });
      if (doctor) {
        // Tính lại trung bình tuyệt đối an toàn bằng cách quét tất cả reviews
        const allReviews = await this.reviewsRepository.find({ where: { doctor_id: doctor.id } });
        if (allReviews.length > 0) {
          const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0);
          doctor.rating = Math.round((totalStars / allReviews.length) * 10) / 10;
        }
        await this.doctorsRepository.save(doctor);
      }
    }

    return savedReview;
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

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);

    // Recalculate doctor rating after deletion
    const doctor = await this.doctorsRepository.findOne({ where: { id: review.doctor_id } });
    if (doctor) {
      const allReviews = await this.reviewsRepository.find({ where: { doctor_id: doctor.id } });
      if (allReviews.length > 0) {
        const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0);
        doctor.rating = Math.round((totalStars / allReviews.length) * 10) / 10;
        doctor.review_count = allReviews.length;
      } else {
        doctor.rating = 0;
        doctor.review_count = 0;
      }
      await this.doctorsRepository.save(doctor);
    }
  }
}
