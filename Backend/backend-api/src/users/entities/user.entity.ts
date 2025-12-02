import { Appointment } from 'src/appointments/entities/appointment.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  full_name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  password_hash: string;

  @Column({ length: 255, unique: true, nullable: true })
  firebase_uid: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'] })
  gender: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  id_card_number: string;

  // Lưu dữ liệu ảnh (URL dài hoặc data URL base64) - dùng longtext cho an toàn
  @Column({ type: 'longtext', nullable: true })
  avatar_url: string;

  // Lưu ảnh CCCD mặt trước
  @Column({ type: 'longtext', nullable: true })
  id_card_front_url: string;

  // Lưu ảnh CCCD mặt sau
  @Column({ type: 'longtext', nullable: true })
  id_card_back_url: string;

  @Column({ default: false })
  is_welcome: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
