import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Banner } from 'src/banner/entities/banner.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  // Liên kết 1-1 với User (Xác thực và thông tin cá nhân)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100, nullable: true })
  specialty: string;

  @Column({ length: 255, nullable: true })
  degree: string;

  @Column({ type: 'int', default: 0 })
  experience_years: number;

  @Column({ length: 100, nullable: true })
  license_number: string;

  // File uploads (URLs)
  @Column({ type: 'varchar', length: 500, nullable: true })
  license_file: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  certificate_file: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cv_file: string;

  // Trạng thái của hồ sơ bác sĩ
  @Column({
    type: 'enum',
    enum: ['pending_verification', 'active', 'rejected', 'suspended'],
    default: 'pending_verification',
  })
  verification_status: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 200000,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  consultation_fee: number;

  @Column({ type: 'float', default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  review_count: number;

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

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Banner, (banner) => banner.doctor)
  banners?: Banner[] | null;
}
