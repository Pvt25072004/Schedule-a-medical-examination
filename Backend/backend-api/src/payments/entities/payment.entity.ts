import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointment_id: number;
  // 12345678,90
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  online_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat: number;

  @Column({
    type: 'enum',
    enum: ['vnpay', 'momo', 'cash', 'atm', 'credit_card'],
  })
  payment_method: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  })
  payment_status: string;

  @Column({ length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Appointment, (appointment) => appointment.payment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
