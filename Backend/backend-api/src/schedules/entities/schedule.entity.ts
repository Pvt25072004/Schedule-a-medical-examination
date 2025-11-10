import { Doctor } from 'src/doctors/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctor_id: number;

  @Column()
  hospital_id: number;

  @Column({ type: 'date' })
  work_date: Date;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ default: 10 })
  max_patients: number;

  @Column({ default: true })
  is_available: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules)
  doctor?: Doctor | null;

  @ManyToOne(() => Hospital)
  hospital?: Hospital | null;
}
