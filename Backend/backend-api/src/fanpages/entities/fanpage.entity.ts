import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fanpages')
export class Fanpage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'hospital_id' })
  hospital_id: number;

  @OneToOne(() => Hospital, (hospital) => hospital.fanpage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  cover_image_url: string;

  @Column({ length: 255, nullable: true })
  cover_public_id: string;

  @Column({ length: 255, nullable: true })
  avatar_url: string;

  @Column({ length: 255, nullable: true })
  avatar_public_id: string;

  @Column({ type: 'int', default: 0 })
  follower_count: number;

  @OneToMany(() => Post, (post) => post.fanpage)
  posts: Post[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
