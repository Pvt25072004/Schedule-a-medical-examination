import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getStats(user: any) {
    if (user?.role === 'admin_hospital') {
      const hospitalId = user.hospital_id;

      const totalAppointments = await this.appointmentRepository.count({ where: { hospital_id: hospitalId } });
      const completedAppointments = await this.appointmentRepository.count({ where: { hospital_id: hospitalId, status: 'completed' } });
      
      const doctorsQuery = this.doctorRepository.createQueryBuilder('doctor')
        .innerJoin('doctor.hospitals', 'hospital')
        .where('hospital.id = :hospitalId', { hospitalId })
        .andWhere('doctor.verification_status = :status', { status: 'active' });
      const totalDoctors = await doctorsQuery.getCount();

      const patientsQuery = this.appointmentRepository.createQueryBuilder('appointment')
        .select('COUNT(DISTINCT appointment.user_id)', 'count')
        .where('appointment.hospital_id = :hospitalId', { hospitalId });
      const totalPatientsRaw = await patientsQuery.getRawOne();
      const totalPatients = parseInt(totalPatientsRaw.count || '0', 10);

      const paymentsQuery = this.paymentRepository.createQueryBuilder('payment')
        .innerJoin('payment.appointment', 'appointment')
        .select('SUM(payment.amount)', 'total_revenue')
        .where('appointment.hospital_id = :hospitalId', { hospitalId })
        .andWhere('payment.payment_status = :status', { status: 'completed' });
      const totalRevenueRaw = await paymentsQuery.getRawOne();
      const totalRevenue = parseFloat(totalRevenueRaw.total_revenue || '0');

      return {
        totalAppointments,
        completedAppointments,
        totalDoctors,
        totalPatients,
        totalRevenue,
      };
    }

    // Super Admin stats
    const totalAppointments = await this.appointmentRepository.count();
    const totalDoctors = await this.doctorRepository.count({ where: { verification_status: 'active' } });
    const totalPatients = await this.userRepository.count({ where: { role: 'patient' } });
    const totalHospitals = await this.hospitalRepository.count({ where: { is_active: true } });

    const paymentsQuery = this.paymentRepository.createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total_revenue')
      .where('payment.payment_status = :status', { status: 'completed' });
    const totalRevenueRaw = await paymentsQuery.getRawOne();
    const totalRevenue = parseFloat(totalRevenueRaw.total_revenue || '0');

    return {
      totalAppointments,
      totalDoctors,
      totalPatients,
      totalHospitals,
      totalRevenue,
    };
  }
}
