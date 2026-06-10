import { Doctor } from 'src/doctors/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ServicePackage } from 'src/service-packages/entities/service-package.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// 1. Import thư viện Swagger
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('appointments')
export class Appointment {
  @ApiProperty({ example: 1, description: 'ID duy nhất của lịch hẹn' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 101, description: 'ID bệnh nhân' })
  @Column()
  user_id: number;

  @ApiPropertyOptional({ example: 202, description: 'ID bác sĩ' })
  @Column({ type: 'int', nullable: true })
  doctor_id: number | null;

  @ApiProperty({ example: 5, description: 'ID bệnh viện' })
  @Column()
  hospital_id: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'ID lịch làm việc của bác sĩ (có thể null nếu chưa liên kết)',
  })
  @Column({ type: 'int', nullable: true })
  schedule_id: number | null;

  @ApiPropertyOptional({ example: '2025-02-27', description: 'Ngày khám (YYYY-MM-DD)' })
  @Column({ type: 'date', nullable: true })
  appointment_date: Date | null;

  @ApiPropertyOptional({ example: '09:30', description: 'Giờ khám (HH:mm)' })
  @Column({ type: 'time', nullable: true })
  appointment_time: string | null;

  @ApiPropertyOptional({ example: '10:00', description: 'Giờ kết thúc khám (tính toán từ duration_minutes)' })
  @Column({ type: 'time', nullable: true })
  end_time: string | null;

  @ApiProperty({
    example: 'online',
    enum: ['online', 'offline'],
    description: 'Hình thức khám',
  })
  @Column({ type: 'enum', enum: ['online', 'offline'] })
  examination_type: string;

  @ApiPropertyOptional({
    example: 'Ho nhẹ, đau đầu',
    description: 'Triệu chứng bệnh (có thể null)',
  })
  @Column({ type: 'text', nullable: true })
  symptoms: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'confirmed', 'checked_in', 'cancelled', 'completed', 'rejected'],
    description: 'Trạng thái lịch hẹn',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'checked_in', 'cancelled', 'completed', 'rejected'],
    default: 'pending',
  })
  status: string;

  @ApiPropertyOptional({
    example: 'Bác sĩ bận đột xuất',
    description: 'Lý do hủy / từ chối lịch hẹn (do bác sĩ hoặc hệ thống)',
  })
  @Column({ type: 'text', nullable: true })
  cancel_reason: string | null;

  // --- Patient Details for "Booking for someone else" ---
  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Tên bệnh nhân thực tế (nếu đặt cho người khác)' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  patient_name: string | null;

  @ApiPropertyOptional({ example: '0987654321', description: 'Số điện thoại bệnh nhân' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  patient_phone: string | null;

  @ApiPropertyOptional({ example: 'Nam', description: 'Giới tính bệnh nhân' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  patient_gender: string | null;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Ngày sinh bệnh nhân' })
  @Column({ type: 'date', nullable: true })
  patient_dob: Date | null;

  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Địa chỉ bệnh nhân' })
  @Column({ type: 'text', nullable: true })
  patient_address: string | null;

  @ApiPropertyOptional({ example: 'Vợ/Chồng', description: 'Mối quan hệ với chủ tài khoản' })
  @Column({ type: 'varchar', length: 50, default: 'Bản thân' })
  relationship: string;
  @ApiProperty({
    example: 'none',
    enum: ['none', 'requested', 'completed'],
    description: 'Trạng thái hoàn tiền (nếu lịch hẹn bị hủy)',
  })
  @Column({
    type: 'enum',
    enum: ['none', 'requested', 'completed'],
    default: 'none',
  })
  refund_status: string;

  @ApiPropertyOptional({ example: 'Vietcombank', description: 'Tên ngân hàng nhận hoàn tiền' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  refund_bank_name: string | null;

  @ApiPropertyOptional({ example: '0123456789', description: 'Số tài khoản nhận hoàn tiền' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  refund_bank_account: string | null;

  @ApiPropertyOptional({ example: 'NGUYEN VAN A', description: 'Tên chủ tài khoản nhận hoàn tiền' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  refund_account_name: string | null;

  @ApiPropertyOptional({ example: 50, description: 'Phần trăm hoàn tiền (100, 50, 0)' })
  @Column({ type: 'int', nullable: true })
  refund_percentage: number | null;

  @ApiProperty({ example: 0, description: 'Số tiền hoàn lại' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refund_amount: number;

  @ApiProperty({ example: false, description: 'Đánh dấu nếu Admin hủy và cho phép dời lịch miễn phí' })
  @Column({ type: 'boolean', default: false })
  admin_cancelled_free_reschedule: boolean;

  @ApiProperty({ example: 0, description: 'Số lần đã dời lịch' })
  @Column({ type: 'int', default: 0 })
  reschedule_count: number;

  // --- Snapshot Fields ---
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  doctor_fee_snapshot: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  hospital_fee_snapshot: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_fee: number;

  @Column({ length: 10, default: 'VND' })
  currency_snapshot: string;

  @Column({ length: 255, nullable: true })
  doctor_name_snapshot: string;

  @Column({ length: 255, nullable: true })
  hospital_name_snapshot: string;

  @ApiProperty({ example: '2025-02-27T08:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2025-02-27T08:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;

  // --- Relations ---
  // Các quan hệ này thường không cần gắn @ApiProperty nếu bạn không trả về
  // toàn bộ object liên quan trong API appointments (trừ khi dùng eager: true).
  // Tuy nhiên, nếu muốn hiển thị trong docs, bạn có thể dùng type: () => Class

  @OneToOne(() => Payment, (payment) => payment.appointment)
  payment: Payment;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor | null;

  @ManyToOne(() => Hospital, (hospital) => hospital.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital | null;

  @OneToOne(() => Review, (review) => review.appointment)
  review?: Review | null;

  @ApiPropertyOptional({ example: 1, description: 'ID của Gói khám (nếu có)' })
  @Column({ type: 'int', nullable: true })
  service_package_id: number | null;

  @ManyToOne(() => ServicePackage, (servicePackage) => servicePackage.appointments)
  @JoinColumn({ name: 'service_package_id' })
  service_package?: ServicePackage | null;
}
