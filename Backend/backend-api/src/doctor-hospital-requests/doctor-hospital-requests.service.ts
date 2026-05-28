import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorHospitalRequest } from './entities/doctor-hospital-request.entity';
import { CreateDoctorHospitalRequestDto, UpdateDoctorHospitalRequestDto } from './dto/doctor-hospital-request.dto';
import { Doctor } from '../doctors/doctor.entity';

@Injectable()
export class DoctorHospitalRequestsService {
  constructor(
    @InjectRepository(DoctorHospitalRequest)
    private readonly requestRepository: Repository<DoctorHospitalRequest>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(dto: CreateDoctorHospitalRequestDto): Promise<DoctorHospitalRequest> {
    const existing = await this.requestRepository.findOne({
      where: { doctor_id: dto.doctor_id, hospital_id: dto.hospital_id, status: 'pending' },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã gửi yêu cầu đến bệnh viện này và đang chờ duyệt.');
    }

    // Check if already in hospital
    const doctor = await this.doctorRepository.findOne({
      where: { id: dto.doctor_id },
      relations: ['hospitals'],
    });

    const isAlreadyInHospital = doctor && doctor.hospitals?.some(h => h.id === dto.hospital_id);

    if (dto.type === 'leave') {
      if (!isAlreadyInHospital) {
        throw new BadRequestException('Bạn không làm việc tại bệnh viện này nên không thể hủy liên kết.');
      }
    } else {
      // Default is 'join'
      if (isAlreadyInHospital) {
        throw new BadRequestException('Bạn đã làm việc tại bệnh viện này rồi.');
      }
    }

    const request = this.requestRepository.create(dto);
    return this.requestRepository.save(request);
  }

  findAllByHospital(hospitalId: number): Promise<DoctorHospitalRequest[]> {
    return this.requestRepository.find({
      where: { hospital_id: hospitalId },
      relations: ['doctor', 'hospital'],
      order: { created_at: 'DESC' },
    });
  }

  findAllByDoctor(doctorId: number): Promise<DoctorHospitalRequest[]> {
    return this.requestRepository.find({
      where: { doctor_id: doctorId },
      relations: ['doctor', 'hospital'],
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(id: number, dto: UpdateDoctorHospitalRequestDto): Promise<DoctorHospitalRequest> {
    const request = await this.requestRepository.findOne({ where: { id }, relations: ['doctor', 'hospital'] });
    if (!request) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }

    request.status = dto.status;
    const saved = await this.requestRepository.save(request);

    if (dto.status === 'approved') {
      const doctor = await this.doctorRepository.findOne({
        where: { id: request.doctor_id },
        relations: ['hospitals'],
      });
      if (doctor) {
        if (!doctor.hospitals) {
          doctor.hospitals = [];
        }
        
        if (request.type === 'leave') {
          // Xóa liên kết
          doctor.hospitals = doctor.hospitals.filter(h => h.id !== request.hospital_id);
          await this.doctorRepository.save(doctor);
        } else {
          // Thêm liên kết (join)
          if (!doctor.hospitals.some(h => h.id === request.hospital_id)) {
            doctor.hospitals.push(request.hospital);
            await this.doctorRepository.save(doctor);
          }
        }
      }
    }

    return saved;
  }
}
