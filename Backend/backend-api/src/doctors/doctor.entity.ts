import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  specialty: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Schedule, (schedule) => schedule.doctor)
  schedules: Schedule[];

  @ManyToMany(() => Hospital, (hospital) => hospital.doctors)
  @JoinTable({
    name: 'doctor_hospital',
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'hospital_id', referencedColumnName: 'id' },
  })
  hospitals: Hospital[];
}
