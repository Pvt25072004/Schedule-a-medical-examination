import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import * as bcrypt from 'bcrypt';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EmailService } from 'src/email/email.service';
import { DoctorApplication } from './doctor-application.entity';
import { CreateDoctorApplicationDto } from './dto/create-doctor-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { RegisterGuestDoctorDto } from './dto/register-guest.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
    @InjectRepository(DoctorApplication)
    private applicationsRepository: Repository<DoctorApplication>,
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
    private emailService: EmailService,
  ) {}

  async findTopRated(): Promise<Doctor[]> {
    // Lấy tất cả bác sĩ hoạt động, sắp xếp theo Rating (giảm dần) và Review Count (giảm dần) để tránh bias
    const doctors = await this.doctorsRepository.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.category', 'category')
      .leftJoinAndSelect('doctor.hospitals', 'hospital')
      .leftJoinAndSelect('doctor.user', 'user')
      .where('doctor.verification_status = :status', { status: 'active' })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .orderBy('doctor.rating', 'DESC')
      .addOrderBy('doctor.review_count', 'DESC')
      .getMany();

    // Group theo chuyên khoa và chỉ lấy bác sĩ xuất sắc nhất của mỗi khoa (Top 1 per Specialty)
    const topRatedPerCategory = new Map<number, Doctor>();
    for (const doc of doctors) {
      const catId = doc.category?.id;
      if (catId && !topRatedPerCategory.has(catId)) {
        topRatedPerCategory.set(catId, doc);
      }
    }

    return Array.from(topRatedPerCategory.values());
  }

  async findAll(hospitalId?: number, categoryId?: number, status?: string, date?: string, time?: string, page: number = 1, limit: number = 100): Promise<{ data: Doctor[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.doctorsRepository.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.category', 'category')
      .leftJoinAndSelect('doctor.hospitals', 'hospital')
      .leftJoinAndSelect('doctor.user', 'user');

    if (hospitalId) {
      query.innerJoin('doctor_hospital', 'dh', 'dh.doctor_id = doctor.id')
           .andWhere('dh.hospital_id = :hospitalId', { hospitalId });
    }

    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }

    if (status) {
      query.andWhere('doctor.verification_status = :status', { status });
    }

    if (date && time) {
      // Filter out doctors who have an appointment at this exact date & time
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('appointment.doctor_id')
          .from('appointments', 'appointment')
          .where('appointment.appointment_date = :date')
          .andWhere('appointment.appointment_time = :time')
          .andWhere('appointment.status IN (:...statuses)')
          .getQuery();
        return 'doctor.id NOT IN ' + subQuery;
      }).setParameter('date', date)
        .setParameter('time', time)
        .setParameter('statuses', ['pending', 'confirmed']);
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number): Promise<Doctor | null> {
    return this.doctorsRepository.findOne({
      where: { id },
      relations: ['category', 'hospitals', 'user'],
    });
  }

  findByEmail(email: string): Promise<Doctor | null> {
    return this.doctorsRepository.findOne({
      where: { user: { email } },
      relations: ['category', 'hospitals', 'user'],
    });
  }

  async createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    const existingByPhone = await this.usersService.findByPhone(dto.phone);

    if (existingByEmail || existingByPhone) {
      throw new ConflictException('Email hoặc số điện thoại đã được sử dụng');
    }

    const hospital = await this.hospitalsRepository.findOne({ where: { id: dto.hospital_id } });
    if (!hospital) {
      throw new NotFoundException('Bệnh viện không tồn tại');
    }

    const passwordHash = await bcrypt.hash(String(dto.password), 10);

    // Tạo user với role doctor để đăng nhập chung hệ thống
    const user = await this.usersService.create({
      full_name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password_hash: passwordHash,
      gender: 'other',
      role: 'doctor',
      is_active: true,
      avatar_url: dto.avatar_url,
      avatar_public_id: dto.avatar_public_id,
    });

    if (!user?.id) {
      throw new ConflictException('Không thể tạo tài khoản user cho bác sĩ');
    }

    const doctorData: Partial<Doctor> = {
      user: user,
      description: dto.description ?? '',
      degree: dto.degree,
      experience_years: dto.experience_years,
      license_number: dto.license_number,
      license_file: dto.license_file,
      certificate_file: dto.certificate_file,
      cv_file: dto.cv_file,
      verification_status: 'active', // Trạng thái active do admin bệnh viện thêm
      hospitals: [hospital], // Liên kết vào bệnh viện
    };

    const doctor = this.doctorsRepository.create(doctorData);

    if (dto.category_id) {
      // Chỉ cần set id cho quan hệ, TypeORM sẽ hiểu đây là Category liên kết
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (doctor as Doctor).category = {
        id: dto.category_id,
      } as Category;
    }

    const savedDoctor = await this.doctorsRepository.save(doctor);

    // Gửi email bất đồng bộ không đợi để tránh làm chậm response
    this.emailService
      .sendDoctorCredentialsEmail(dto.email, dto.password, dto.name)
      .catch((err) => {
        console.error('Không thể gửi email thông tin đăng nhập cho bác sĩ:', err);
      });

    return savedDoctor;
  }

  async registerGuestDoctor(dto: RegisterGuestDoctorDto): Promise<DoctorApplication> {
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    const existingByPhone = await this.usersService.findByPhone(dto.phone);

    if (existingByEmail || existingByPhone) {
      throw new ConflictException('Email hoặc số điện thoại đã được sử dụng. Vui lòng đăng nhập nếu bạn đã có tài khoản.');
    }

    const hospital = await this.hospitalsRepository.findOne({ where: { id: dto.hospital_id } });
    if (!hospital) {
      throw new NotFoundException('Bệnh viện không tồn tại');
    }

    // Tạo user ẩn (is_active = false)
    // Passw rỗng tạm thời, sẽ được gen và gửi khi Admin phê duyệt
    const user = await this.usersService.create({
      full_name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password_hash: '', // Tạm thời để trống
      gender: 'other',
      role: 'doctor',
      is_active: false,
    });

    if (!user?.id) {
      throw new ConflictException('Không thể tạo tài khoản tạm thời');
    }

    // Tạo Doctor với trạng thái pending
    const doctorData: Partial<Doctor> = {
      user: user,
      degree: dto.degree,
      experience_years: dto.experience_years,
      license_number: dto.license_number,
      license_file: dto.license_file,
      certificate_file: dto.certificate_file,
      cv_file: dto.cv_file,
      verification_status: 'pending_verification',
      hospitals: [], // Chưa có liên kết chính thức
    };

    if (dto.category_id) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (doctorData as Doctor).category = { id: dto.category_id } as Category;
    }

    const doctor = this.doctorsRepository.create(doctorData);
    const savedDoctor = await this.doctorsRepository.save(doctor);

    // Tạo đơn ứng tuyển
    const application = this.applicationsRepository.create({
      doctor: savedDoctor,
      hospital: hospital,
      cover_letter: dto.cover_letter,
      type: 'join',
      status: 'pending',
    });

    return this.applicationsRepository.save(application);
  }

  async toggleActive(id: number): Promise<Doctor> {
    const doctor = await this.findOne(id);
    if (!doctor || !doctor.user) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    doctor.verification_status = doctor.verification_status === 'active' ? 'suspended' : 'active';
    const saved = await this.doctorsRepository.save(doctor);

    // Đồng bộ trạng thái với bảng users (login)
    await this.usersService.update(doctor.user.id, {
      is_active: doctor.verification_status === 'active',
    } as any);

    return saved;
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    if (doctor.user?.avatar_public_id) {
      await this.cloudinaryService.deleteImage(doctor.user.avatar_public_id);
    }
    
    await this.doctorsRepository.remove(doctor);
  }

  async updateProfileByEmail(
    email: string,
    dto: UpdateDoctorProfileDto,
  ): Promise<Doctor> {
    const doctor = await this.findByEmail(email);
    if (!doctor || !doctor.user) {
      throw new NotFoundException(`Doctor with email ${email} not found`);
    }

    const oldAvatarPublicId = doctor.user.avatar_public_id;

    let userUpdated = false;
    const userUpdates: any = {};

    if (dto.name !== undefined) {
      userUpdates.full_name = dto.name;
      userUpdated = true;
    }
    if (dto.avatar_url !== undefined) {
      userUpdates.avatar_url = dto.avatar_url;
      userUpdated = true;
    }
    if (dto.avatar_public_id !== undefined) {
      userUpdates.avatar_public_id = dto.avatar_public_id;
      userUpdated = true;
    }
    if (dto.password) {
      if (!dto.old_password) {
        throw new BadRequestException('Vui lòng nhập mật khẩu cũ để đổi mật khẩu mới');
      }
      const isMatch = await bcrypt.compare(dto.old_password, doctor.user.password_hash);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu cũ không chính xác');
      }
      userUpdates.password_hash = await bcrypt.hash(dto.password, 10);
      userUpdated = true;
    }

    if (userUpdated) {
      await this.usersService.update(doctor.user.id, userUpdates);
    }

    if (dto.degree !== undefined) doctor.degree = dto.degree;
    if (dto.experience_years !== undefined) doctor.experience_years = dto.experience_years;
    if (dto.license_number !== undefined) doctor.license_number = dto.license_number;
    if (dto.license_file !== undefined) doctor.license_file = dto.license_file;
    if (dto.certificate_file !== undefined) doctor.certificate_file = dto.certificate_file;
    if (dto.cv_file !== undefined) doctor.cv_file = dto.cv_file;

    if (dto.description !== undefined) {
      doctor.description = dto.description;
    }
    if (dto.category_id) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (doctor as Doctor).category = {
        id: dto.category_id,
      } as Category;
    }

    if (
      Array.isArray(dto.hospitalIds) &&
      (dto.hospitalIds as number[]).length > 0
    ) {
      const hospitals = await this.hospitalsRepository.find({
        where: { id: In(dto.hospitalIds as number[]) },
      });
      doctor.hospitals = hospitals;
    }

    const savedDoctor = await this.doctorsRepository.save(doctor);

    if (
      dto.avatar_public_id &&
      oldAvatarPublicId &&
      oldAvatarPublicId !== dto.avatar_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldAvatarPublicId);
    }

    return savedDoctor;
  }

  async unlinkDoctor(doctorId: number, hospitalId: number, reason: string): Promise<void> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
      relations: ['hospitals', 'user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const hospital = await this.hospitalsRepository.findOne({ where: { id: hospitalId } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    const isLinked = doctor.hospitals.some(h => h.id === hospitalId);
    if (!isLinked) throw new BadRequestException('Bác sĩ này không làm việc tại bệnh viện của bạn');

    // Hủy liên kết
    doctor.hospitals = doctor.hospitals.filter(h => h.id !== hospitalId);
    await this.doctorsRepository.save(doctor);

    // Gửi email cho bác sĩ
    if (doctor.user?.email) {
      this.emailService.sendDoctorUnlinkedEmail(
        doctor.user.email,
        doctor.user.full_name || 'Bác sĩ',
        hospital.name,
        reason || 'Không có lý do',
      ).catch(err => console.error(err));
    }
  }

  async createApplication(email: string, dto: CreateDoctorApplicationDto): Promise<DoctorApplication> {
    const doctor = await this.findByEmail(email);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const type = dto.type || 'join';

    if (type === 'join' && doctor.hospitals && doctor.hospitals.length >= 2) {
      throw new BadRequestException('Bạn chỉ được liên kết tối đa 2 bệnh viện');
    }

    const hospital = await this.hospitalsRepository.findOne({ where: { id: dto.hospital_id } });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    const existingApp = await this.applicationsRepository.findOne({
      where: { doctor: { id: doctor.id }, hospital: { id: hospital.id }, status: 'pending', type },
    });
    if (existingApp) {
      throw new BadRequestException('Bạn đã gửi yêu cầu này đến bệnh viện và đang chờ duyệt');
    }

    // Kiểm tra tính hợp lệ của type
    const isAlreadyLinked = doctor.hospitals?.some(h => h.id === hospital.id);
    if (type === 'join' && isAlreadyLinked) {
      throw new BadRequestException('Bạn đang làm việc tại bệnh viện này rồi');
    }
    if (type === 'leave' && !isAlreadyLinked) {
      throw new BadRequestException('Bạn không làm việc tại bệnh viện này nên không thể xin nghỉ');
    }

    const application = this.applicationsRepository.create({
      doctor,
      hospital,
      cover_letter: dto.cover_letter,
      type,
    });

    return this.applicationsRepository.save(application);
  }

  async getDoctorApplications(email: string): Promise<DoctorApplication[]> {
    const doctor = await this.findByEmail(email);
    if (!doctor) {
      return [];
    }
    return this.applicationsRepository.find({
      where: { doctor: { id: doctor.id } },
      relations: ['hospital'],
      order: { created_at: 'DESC' },
    });
  }

  async getHospitalApplications(hospitalId: number): Promise<DoctorApplication[]> {
    return this.applicationsRepository.find({
      where: { hospital: { id: hospitalId } },
      relations: ['doctor', 'doctor.user'],
      order: { created_at: 'DESC' },
    });
  }

  async updateApplicationStatus(id: number, dto: UpdateApplicationStatusDto): Promise<DoctorApplication> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['doctor', 'doctor.hospitals', 'doctor.user', 'hospital'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể cập nhật trạng thái đơn đang chờ duyệt');
    }

    application.status = dto.status;
    
    if (dto.status === 'approved') {
      if (!application.doctor.hospitals) {
        application.doctor.hospitals = [];
      }
      
      if (application.type === 'join') {
        if (application.doctor.hospitals.length >= 2) {
          throw new BadRequestException('Bác sĩ này đã đạt giới hạn 2 bệnh viện liên kết');
        }
        const alreadyHas = application.doctor.hospitals.some(h => h.id === application.hospital.id);
        if (!alreadyHas) {
          application.doctor.hospitals.push(application.hospital);
          
          if (application.doctor.user && !application.doctor.user.is_active) {
            // Đây là bác sĩ mới ứng tuyển (Guest), kích hoạt và gửi pass
            const plainPassword = Math.random().toString(36).slice(-8); // Random password 8 chars
            const passwordHash = await bcrypt.hash(plainPassword, 10);
            
            application.doctor.verification_status = 'active';
            await this.doctorsRepository.save(application.doctor);

            await this.usersService.update(application.doctor.user.id, {
              is_active: true,
              password_hash: passwordHash,
            });

            this.emailService.sendDoctorCredentialsEmail(
              application.doctor.user.email,
              plainPassword,
              application.doctor.user.full_name || 'Bác sĩ'
            ).catch(err => console.error(err));
          } else {
            // Bác sĩ đã có tài khoản, chỉ gửi email báo duyệt
            await this.doctorsRepository.save(application.doctor);
            
            if (application.doctor.user?.email) {
              this.emailService.sendDoctorApplicationApprovedEmail(
                application.doctor.user.email,
                application.doctor.user.full_name || 'Bác sĩ',
                application.hospital.name
              ).catch(err => console.error(err));
            }
          }
        }
      } else if (application.type === 'leave') {
        application.doctor.hospitals = application.doctor.hospitals.filter(h => h.id !== application.hospital.id);
        await this.doctorsRepository.save(application.doctor);
      }
    } else if (dto.status === 'rejected') {
      application.rejection_reason = dto.rejection_reason || '';
    }

    return this.applicationsRepository.save(application);
  }
}

