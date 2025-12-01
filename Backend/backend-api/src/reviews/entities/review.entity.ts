import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Entity,
  ManyToOne,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointment_id: number;

  @Column()
  user_id: number;

  @Column()
  doctor_id: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Appointment)
  appointment?: Appointment | null;

  @ManyToOne(() => User)
  user?: User | null;

  @ManyToOne(() => Doctor)
  doctor?: Doctor | null;
}
