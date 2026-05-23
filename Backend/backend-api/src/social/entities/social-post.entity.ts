import { Hospital } from 'src/hospitals/entities/hospital.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialLike } from './social-like.entity';
import { SocialComment } from './social-comment.entity';

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  hospital_id: number;

  @ManyToOne(() => Hospital, (hospital) => hospital.social_posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_public_id: string | null;

  @Column({ type: 'int', default: 0 })
  like_count: number;

  @Column({ type: 'int', default: 0 })
  comment_count: number;

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => SocialLike, (like) => like.post)
  likes: SocialLike[];

  @OneToMany(() => SocialComment, (comment) => comment.post)
  comments: SocialComment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
