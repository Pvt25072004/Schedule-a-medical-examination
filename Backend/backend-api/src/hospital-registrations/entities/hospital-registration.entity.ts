import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HospitalRegistrationStatus {
  PENDING = 'pending',
  NEEDS_REVISION = 'needs_revision',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('hospital_registrations')
export class HospitalRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Step 1: Admin_Hospital Account Info ---
  @Column({ length: 255 })
  admin_email: string;

  @Column({ length: 255, nullable: true })
  admin_name: string;

  @Column({ length: 50, nullable: true })
  admin_phone: string;

  @Column({ length: 100, nullable: true })
  admin_role: string; // e.g., "Chủ bệnh viện", "Giám đốc"

  // --- Step 2: Medical Facility Info ---
  @Column({ length: 255, nullable: true })
  hospital_name: string;

  @Column({ length: 100, nullable: true })
  hospital_type: string;

  @Column({ length: 50, nullable: true })
  business_license_number: string;

  @Column({ length: 100, nullable: true })
  scale: string; // e.g., "<50 giường"

  @Column({ nullable: true })
  founded_year: number;

  @Column({ length: 500, nullable: true })
  logo_url: string;

  // --- Step 3: Address & Contact ---
  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 100, nullable: true })
  ward: string;

  @Column({ length: 500, nullable: true })
  address_proof_url: string;

  @Column({ length: 50, nullable: true })
  hotline: string;

  @Column({ length: 255, nullable: true })
  contact_email: string;

  @Column({ length: 255, nullable: true })
  open_hours: string; // Could be JSON or string

  // --- Step 4: Legal Documents ---
  @Column({ length: 500, nullable: true })
  operating_license_url: string;

  @Column({ length: 500, nullable: true })
  business_license_url: string;

  @Column({ length: 500, nullable: true })
  quality_certificate_url: string;

  @Column({ length: 500, nullable: true })
  health_department_doc_url: string;

  // --- Step 5: Doctors Team ---
  @Column({ nullable: true })
  doctor_count: number;

  @Column({ length: 255, nullable: true })
  main_specialty: string;

  @Column({ type: 'text', nullable: true })
  key_doctors_list: string;

  // --- Step 6: Policy & Fees ---
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platform_fee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_rate: number;

  @Column({ default: false })
  accepts_online_payment: boolean;

  @Column({ type: 'text', nullable: true })
  payment_methods: string; // JSON array or comma separated

  @Column({ type: 'text', nullable: true })
  cancellation_policy: string;

  @Column({ length: 100, nullable: true })
  refund_time: string;

  // --- Status and Admin Controls ---
  @Column({
    type: 'enum',
    enum: HospitalRegistrationStatus,
    default: HospitalRegistrationStatus.PENDING,
  })
  status: HospitalRegistrationStatus;

  @Column({ type: 'text', nullable: true })
  revision_notes: string; // JSON storing fields that need revision or simple string

  @Column({ type: 'text', nullable: true })
  internal_notes: string; // Notes only visible to admin

  @Column({ length: 10, nullable: true })
  verification_otp: string; // Simple OTP for email verification at step 1

  @Column({ default: false })
  is_email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
