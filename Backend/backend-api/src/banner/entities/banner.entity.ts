import { Category } from 'src/categories/entities/category.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 500 })
  image_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_public_id: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  redirect_url: string | null;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  @Column({ nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category, (category) => category.banners, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category | null;

  @Column({ nullable: true })
  doctor_id: number | null;

  @ManyToOne(() => Doctor, (doctor) => doctor.banners, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor | null;

  @Column({ nullable: true })
  hospital_id: number;

  @ManyToOne(() => Hospital, (hospital) => hospital.banners)
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
