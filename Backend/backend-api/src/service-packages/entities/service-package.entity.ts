import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('service_packages')
export class ServicePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  fixed_price: number;

  @Column({ type: 'int', default: 30 })
  duration_minutes: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  booking_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Category, (category) => category.service_packages)
  @JoinTable({
    name: 'service_package_categories',
    joinColumn: { name: 'service_package_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @ManyToMany(() => Hospital, (hospital) => hospital.service_packages)
  @JoinTable({
    name: 'hospital_service_packages',
    joinColumn: { name: 'service_package_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'hospital_id', referencedColumnName: 'id' },
  })
  hospitals: Hospital[];

  @ManyToMany(() => Doctor, (doctor) => doctor.service_packages)
  @JoinTable({
    name: 'doctor_service_packages',
    joinColumn: { name: 'service_package_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
  })
  doctors: Doctor[];

  @OneToMany(() => Appointment, (appointment) => appointment.service_package)
  appointments: Appointment[];
}
