import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToOne,
  JoinColumn,
} from 'typeorm';
@Entity()
@Unique(['auth_provider', 'provider_id'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  full_name: string;

  @Column({
    type: 'enum',
    enum: ['patient', 'doctor', 'admin', 'admin_hospital'],
    default: 'patient',
  })
  role: string;

  @Column({ length: 255, unique: true, nullable: true })
  email: string;

  @Column({ length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  password_hash: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @Column({ length: 255, nullable: true })
  provider_id: string;

  @Column({
    type: 'enum',
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  })
  auth_provider: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  id_card_number: string;

  // Lưu dữ liệu ảnh (URL dài hoặc data URL base64) - dùng longtext cho an toàn
  @Column({ type: 'longtext', nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_public_id: string;

  // Lưu ảnh CCCD mặt trước
  @Column({ type: 'longtext', nullable: true })
  id_card_front_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  id_card_front_public_id: string;

  // Lưu ảnh CCCD mặt sau
  @Column({ type: 'longtext', nullable: true })
  id_card_back_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  id_card_back_public_id: string;

  @Column({ default: false })
  is_welcome: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ nullable: true, unique: true })
  hospital_id: number;

  @OneToOne(() => Hospital, { nullable: true })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;
}
