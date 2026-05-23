import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SocialPost } from './social-post.entity';

@Entity('social_likes')
@Unique(['post_id', 'user_id'])
export class SocialLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  post_id: number;

  @ManyToOne(() => SocialPost, (post) => post.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: SocialPost;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
