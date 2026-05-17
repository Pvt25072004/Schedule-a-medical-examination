import { User } from 'src/users/entities/user.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1 to 5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column()
  user_id: number;

  @Column()
  doctor_id: number;

  @Column()
  appointment_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
