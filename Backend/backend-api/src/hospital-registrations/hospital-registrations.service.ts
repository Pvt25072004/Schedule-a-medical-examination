import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HospitalRegistration,
  HospitalRegistrationStatus,
} from './entities/hospital-registration.entity';
import {
  CreateHospitalRegistrationDto,
  SubmitHospitalRegistrationDto,
  VerifyOtpDto,
} from './dto/create-hospital-registration.dto';
import { UpdateHospitalRegistrationStatusDto } from './dto/update-hospital-registration.dto';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HospitalRegistrationsService {
  constructor(
    @InjectRepository(HospitalRegistration)
    private readonly repo: Repository<HospitalRegistration>,
    private emailService: EmailService,
    private usersService: UsersService,
    private hospitalsService: HospitalsService,
  ) { }

  async initRegistration(dto: CreateHospitalRegistrationDto) {
    // Check if email already exists in users
    const existingUser = await this.usersService.findByEmail(dto.admin_email);
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng trong hệ thống');
    }

    let registration = await this.repo.findOne({
      where: { admin_email: dto.admin_email },
    });

    if (!registration) {
      registration = this.repo.create({
        admin_email: dto.admin_email,
        admin_name: dto.admin_name,
        admin_phone: dto.admin_phone,
        admin_role: dto.admin_role,
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    registration.verification_otp = otp;
    registration.is_email_verified = false;

    await this.repo.save(registration);

    // Send OTP via EmailService
    await this.emailService.sendOtpEmail(dto.admin_email, otp);

    return { 
      message: 'OTP đã được gửi đến email của bạn',
      registrationId: registration.id
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const registration = await this.repo.findOne({
      where: { admin_email: dto.admin_email },
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy phiên đăng ký');
    }

    if (registration.verification_otp !== dto.otp) {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    registration.is_email_verified = true;
    registration.verification_otp = "";
    await this.repo.save(registration);

    return {
      message: 'Xác thực thành công',
      registrationId: registration.id,
    };
  }

  async submitRegistration(id: number, dto: SubmitHospitalRegistrationDto) {
    const registration = await this.repo.findOne({ where: { id } });
    if (!registration) throw new NotFoundException('Không tìm thấy đơn đăng ký');
    if (!registration.is_email_verified) {
      throw new BadRequestException('Email chưa được xác thực');
    }

    Object.assign(registration, dto);
    registration.status = HospitalRegistrationStatus.PENDING;

    return this.repo.save(registration);
  }

  findAll() {
    return this.repo.find({
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(id: number, dto: UpdateHospitalRegistrationStatusDto) {
    const registration = await this.repo.findOne({ where: { id } });
    if (!registration) throw new NotFoundException('Không tìm thấy đơn đăng ký');

    registration.status = dto.status;
    if (dto.revision_notes) registration.revision_notes = dto.revision_notes;
    if (dto.internal_notes) registration.internal_notes = dto.internal_notes;

    // Post-approval hooks
    if (dto.status === HospitalRegistrationStatus.APPROVED) {
      // 1. Create Hospital
      const newHospital = await this.hospitalsService.create({
        name: registration.hospital_name || 'TBA',
        address: `${registration.address}, ${registration.ward}, ${registration.district}, ${registration.province}`,
        phone: registration.hotline || 'N/A',
        email: registration.contact_email || registration.admin_email,
        main_specialty: registration.main_specialty || '',
        city: registration.province || '',
      });

      // 2. Create User (Admin Hospital)
      const rawPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(rawPassword, 10);

      const user = await this.usersService.create({
        email: registration.admin_email,
        password_hash: passwordHash,
        full_name: registration.admin_name || 'Admin Hospital',
        phone: registration.admin_phone,
        role: 'admin_hospital',
        // In reality, we should link the user to the hospital entity.
        // Assuming hospitalsService has logic or we just link it if User entity supports it.
        // For now, this grants them login access.
      });

      // 3. Send Email with credentials
      await this.emailService.sendDoctorCredentialsEmail(
        registration.admin_email,
        rawPassword,
        registration.admin_name || 'Admin',
      );
    } else if (dto.status === HospitalRegistrationStatus.REJECTED) {
      await this.emailService.sendRejectionEmail(
        registration.admin_email,
        registration.admin_name || 'Admin',
        dto.revision_notes || 'Không đáp ứng yêu cầu của nền tảng.',
      );
    } else if (dto.status === HospitalRegistrationStatus.NEEDS_REVISION) {
      // Send email requesting revision
      // You can add a new method in email service: sendRevisionRequestEmail
    }

    return this.repo.save(registration);
  }
}
