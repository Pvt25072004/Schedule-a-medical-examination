import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto, user: any) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: createMedicalRecordDto.appointment_id },
      relations: ['doctor', 'doctor.user']
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }

    if (user.role === 'doctor' && appointment.doctor?.user?.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền tạo bệnh án cho bệnh nhân của bác sĩ khác');
    }

    if (appointment.status !== 'paid' && appointment.status !== 'confirmed' && appointment.status !== 'pending') {
      throw new BadRequestException('Lịch hẹn này không hợp lệ để ghi bệnh án');
    }

    const existingRecord = await this.medicalRecordsRepository.findOne({
      where: { appointment_id: createMedicalRecordDto.appointment_id }
    });

    if (existingRecord) {
      throw new BadRequestException('Lịch hẹn này đã có hồ sơ bệnh án');
    }

    const record = this.medicalRecordsRepository.create(createMedicalRecordDto);
    const savedRecord = await this.medicalRecordsRepository.save(record);

    // Update appointment status to completed
    appointment.status = 'completed';
    await this.appointmentsRepository.save(appointment);

    return savedRecord;
  }

  async findByAppointment(appointmentId: number, user: any) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'doctor.user']
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }

    if (user.role === 'patient' && appointment.user_id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem hồ sơ của người khác');
    }

    if (user.role === 'admin_hospital' && appointment.hospital_id !== user.hospital_id) {
      throw new ForbiddenException('Bạn không có quyền xem hồ sơ của cơ sở khác');
    }

    if (user.role === 'doctor' && appointment.doctor?.user?.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem hồ sơ của bác sĩ khác');
    }

    return this.medicalRecordsRepository.findOne({
      where: { appointment_id: appointmentId }
    });
  }

  async findMyRecords(user: any) {
    if (user.role !== 'patient') {
      throw new ForbiddenException('Chỉ bệnh nhân mới có thể xem danh sách hồ sơ bệnh án của mình');
    }

    return this.medicalRecordsRepository.find({
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user', 'appointment.hospital'],
      where: {
        appointment: {
          user_id: user.id
        }
      },
      order: {
        created_at: 'DESC'
      }
    });
  }
}
