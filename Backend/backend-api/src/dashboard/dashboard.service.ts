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
    const totalAppointments = await this.appointmentRepository.count({ where: { status: 'completed' } });
    const totalDoctors = await this.doctorRepository.count({ where: { verification_status: 'active' } });
    const totalUsersCount = await this.userRepository.createQueryBuilder('user')
      .where('user.role != :role', { role: 'admin' })
      .getCount();
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
      totalUsersCount,
      totalHospitals,
      totalRevenue,
    };
  }

  async getAdminCharts(startDate?: string, endDate?: string, status?: string) {
    // 1. Lượt khám theo bệnh viện
    const appointmentsQuery = this.appointmentRepository.createQueryBuilder('appointment')
      .innerJoin('appointment.hospital', 'hospital')
      .select(['hospital.id AS hospital_id', 'hospital.name AS hospital_name', 'COUNT(appointment.id) AS appointment_count']);

    if (startDate) appointmentsQuery.andWhere('appointment.created_at >= :startDate', { startDate });
    if (endDate) appointmentsQuery.andWhere('appointment.created_at <= :endDate', { endDate });
    if (status && status !== 'all') appointmentsQuery.andWhere('appointment.status = :status', { status });

    appointmentsQuery
      .groupBy('hospital.id')
      .addGroupBy('hospital.name');
    
    const appointmentsByHospitalRaw = await appointmentsQuery.getRawMany();
    const appointmentsByHospital = appointmentsByHospitalRaw.map(row => ({
      hospital_name: row.hospital_name,
      appointment_count: parseInt(row.appointment_count || '0', 10),
    }));

    // 2. Doanh thu theo bệnh viện
    const paymentsQuery = this.paymentRepository.createQueryBuilder('payment')
      .innerJoin('payment.appointment', 'appointment')
      .innerJoin('appointment.hospital', 'hospital')
      .select(['hospital.id AS hospital_id', 'hospital.name AS hospital_name', 'SUM(payment.amount) AS total_revenue'])
      
    if (status && status !== 'all') {
      if (status === 'completed') paymentsQuery.where('payment.payment_status = :status', { status: 'completed' });
      else if (status === 'pending') paymentsQuery.where('payment.payment_status = :status', { status: 'pending' });
    } else {
      paymentsQuery.where('payment.payment_status = :status', { status: 'completed' });
    }

    if (startDate) paymentsQuery.andWhere('payment.created_at >= :startDate', { startDate });
    if (endDate) paymentsQuery.andWhere('payment.created_at <= :endDate', { endDate });

    paymentsQuery
      .groupBy('hospital.id')
      .addGroupBy('hospital.name');

    const revenueByHospitalRaw = await paymentsQuery.getRawMany();
    const revenueByHospital = revenueByHospitalRaw.map(row => ({
      hospital_name: row.hospital_name,
      total_revenue: parseFloat(row.total_revenue || '0'),
    }));

    // 3. Số lượng bệnh viện sử dụng theo từng chuyên khoa
    const categoriesUsageRaw = await this.hospitalRepository.manager.query(`
      SELECT c.name as category_name, COUNT(hc.hospital_id) as hospital_count 
      FROM categories c
      LEFT JOIN hospital_category hc ON c.id = hc.category_id
      GROUP BY c.id, c.name
      ORDER BY hospital_count DESC
    `);
    const categoriesUsage = categoriesUsageRaw.map((row: any) => ({
      category_name: row.category_name,
      hospital_count: parseInt(row.hospital_count || '0', 10),
    }));

    return {
      appointmentsByHospital,
      revenueByHospital,
      categoriesUsage,
    };
  }
}
