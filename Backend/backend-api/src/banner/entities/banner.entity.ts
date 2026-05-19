import { Category } from 'src/categories/entities/category.entity';
import { Doctor } from 'src/doctors/doctor.entity';
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
  description: string;

  @Column({ length: 500 })
  image_url: string;

  @Column({ length: 500, nullable: true })
  redirect_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ nullable: true })
  category_id: number;

  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'SET NULL',
    type: 'int',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category | null;

  @Column({ nullable: true })
  doctor_id: number;

  @ManyToOne(() => Doctor, {
    nullable: true,
    onDelete: 'SET NULL',
    type: 'int',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
