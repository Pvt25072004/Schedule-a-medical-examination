import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestsRepository: Repository<LeaveRequest>,
    private readonly appointmentsService: AppointmentsService,
    // We can use query builder for schedules and appointments directly or via services
  ) {}

  async create(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const leave = this.leaveRequestsRepository.create(dto);
    return await this.leaveRequestsRepository.save(leave);
  }

  async findAll(): Promise<LeaveRequest[]> {
    return await this.leaveRequestsRepository.find({
      order: { created_at: 'DESC' },
      relations: ['doctor', 'doctor.user'],
    });
  }

  async findByDoctor(doctorId: number): Promise<LeaveRequest[]> {
    return await this.leaveRequestsRepository.find({
      where: { doctor_id: doctorId },
      order: { created_at: 'DESC' },
    });
  }

  async approve(id: number): Promise<LeaveRequest> {
    const leave = await this.leaveRequestsRepository.findOne({ where: { id } });
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status === 'approved') {
      return leave; // Already approved
    }

    leave.status = 'approved';
    const savedLeave = await this.leaveRequestsRepository.save(leave);

    // 1. Block schedules
    const dateStr = leave.leave_date.toString().slice(0, 10);
    await this.leaveRequestsRepository.manager.update(
      Schedule,
      { doctor_id: leave.doctor_id, work_date: dateStr },
      { is_available: false, approval_status: 'rejected' }
    );

    // 2. Mass Cancel Appointments
    const affectedAppointments = await this.leaveRequestsRepository.manager.find(Appointment, {
      where: {
        doctor_id: leave.doctor_id,
        appointment_date: dateStr as any,
        status: In(['pending', 'confirmed']),
      },
    });

    for (const appt of affectedAppointments) {
      // Use appointmentsService to leverage its built-in notification & FCM logic
      await this.appointmentsService.updateStatus(
        appt.id,
        'cancelled',
        `Bác sĩ có việc bận đột xuất: ${leave.reason}. Mong quý khách thông cảm!`
      );
    }

    return savedLeave;
  }

  async reject(id: number): Promise<LeaveRequest> {
    const leave = await this.leaveRequestsRepository.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    
    leave.status = 'rejected';
    return await this.leaveRequestsRepository.save(leave);
  }
}
