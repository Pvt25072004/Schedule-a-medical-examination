import { Doctor } from 'src/doctors/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  user_id: number;

  @Column()
  doctor_id: number;

  @Column()
  hospital_id: number;

  @Column({ type: 'date' })
  appointment_date: Date;

  @Column({ type: 'time' })
  appointment_time: string;

  @Column({ type: 'enum', enum: ['online', 'offline'] })
  examination_type: string;

  @Column({ type: 'text', nullable: true })
  symptoms: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Payment, (payment) => payment.appointment)
  payment: Payment;

  @ManyToOne(() => User, (user) => user.appointments)
  user?: User | null;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  doctor?: Doctor | null;

  @ManyToOne(() => Hospital, (hospital) => hospital.appointments)
  hospital?: Hospital | null;
}
