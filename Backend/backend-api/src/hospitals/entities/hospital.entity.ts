import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Area } from 'src/areas/entities/area.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Specialty } from 'src/specialties/entities/specialty.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100, nullable: true })
  main_specialty: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  area_id: number;

  @OneToMany(() => Appointment, (appointment) => appointment.hospital)
  appointments: Appointment[];

  @ManyToMany(() => Doctor, (doctor) => doctor.hospitals)
  doctors: Doctor[];

  @ManyToOne(() => Area, (area) => area.hospitals)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @ManyToMany(() => Specialty, (specialty) => specialty.hospitals)
  @JoinTable({ name: 'hospital_specialties' })
  specialties: Specialty[];
}
