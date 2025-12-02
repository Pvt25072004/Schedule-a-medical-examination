import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('appointments')
export class Appointment {
  @ApiProperty({ example: 1, description: 'ID duy nhất của lịch hẹn' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 101, description: 'ID bệnh nhân' })
  @Column()
  user_id: number;

  @ApiProperty({ example: 202, description: 'ID bác sĩ' })
  @Column()
  doctor_id: number;

  @ApiProperty({ example: 5, description: 'ID bệnh viện' })
  @Column()
  hospital_id: number;

  @ApiProperty({ example: 20, description: 'ID lịch làm việc của bác sĩ' })
  @Column()
  schedule_id: number;

  @ApiProperty({ example: '2025-02-27', description: 'Ngày khám (YYYY-MM-DD)' })
  @Column({ type: 'date' })
  appointment_date: Date;

  @ApiProperty({ example: '09:30', description: 'Giờ khám (HH:mm)' })
  @Column({ type: 'time' })
  appointment_time: string;

  @ApiProperty({
    example: 'online',
    enum: ['online', 'offline'],
    description: 'Hình thức khám',
  })
  @Column({ type: 'enum', enum: ['online', 'offline'] })
  examination_type: string;

  @ApiPropertyOptional({
    example: 'Ho nhẹ, đau đầu',
    description: 'Triệu chứng bệnh (có thể null)',
  })
  @Column({ type: 'text', nullable: true })
  symptoms: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    description: 'Trạng thái lịch hẹn',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending',
  })
  status: string;

  @ApiProperty({ example: '2025-02-27T08:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2025-02-27T08:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;

  // --- Relations ---
  @OneToOne(() => Payment, (payment) => payment.appointment)
  payment: Payment;

  @ManyToOne(() => User, (user) => user.appointments)
  user?: User | null;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  doctor?: Doctor | null;

  @ManyToOne(() => Hospital, (hospital) => hospital.appointments)
  hospital?: Hospital | null;

  @ManyToOne(() => Schedule, (schedule) => schedule.appointments)
  @JoinColumn({ name: 'schedule_id' })
  schedule?: Schedule;
}
