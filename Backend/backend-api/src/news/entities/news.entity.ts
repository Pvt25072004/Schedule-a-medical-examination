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

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_public_id: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string | null;

  @Column({ default: true })
  is_published: boolean;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date | null;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
