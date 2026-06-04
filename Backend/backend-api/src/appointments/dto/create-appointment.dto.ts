import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  Matches,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
// 1. Import thêm ApiProperty và ApiPropertyOptional
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  // --- USER ID ---
  @ApiProperty({
    example: 1,
    description: 'ID của bệnh nhân (lấy từ bảng users)',
  })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  // --- DOCTOR ID ---
  @ApiProperty({
    example: 101,
    description: 'ID của bác sĩ',
  })
  @IsInt()
  @IsNotEmpty()
  doctor_id: number;

  // --- HOSPITAL ID ---
  @ApiProperty({
    example: 5,
    description: 'ID của bệnh viện/phòng khám',
  })
  @IsInt()
  @IsNotEmpty()
  hospital_id: number;

  // --- SCHEDULE ID ---
  @ApiPropertyOptional({
    example: 20,
    description: 'ID lịch làm việc của bác sĩ (tùy chọn)',
  })
  @IsInt()
  @IsOptional()
  schedule_id?: number;

  // --- SERVICE PACKAGE ID ---
  @ApiPropertyOptional({
    example: 1,
    description: 'ID của gói khám (tùy chọn)',
  })
  @IsInt()
  @IsOptional()
  service_package_id?: number;

  // --- DATE ---
  @ApiProperty({
    example: '2025-11-20',
    description: 'Ngày hẹn khám (Format: YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  appointment_date: string;

  // --- TIME ---
  @ApiProperty({
    example: '09:30',
    description: 'Giờ hẹn (Format: HH:mm)',
    pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Thời gian hẹn không hợp lệ (HH:mm)',
  })
  appointment_time: string;

  // --- TYPE ---
  @ApiProperty({
    example: 'online',
    enum: ['online', 'offline'],
    description: 'Hình thức khám bệnh',
  })
  @IsEnum(['online', 'offline'])
  @IsNotEmpty()
  examination_type: string;

  // --- SYMPTOMS (Optional) ---
  @ApiPropertyOptional({
    example: 'Đau đầu, sốt nhẹ, ho khan',
    description: 'Mô tả triệu chứng bệnh (không bắt buộc)',
  })
  @IsOptional()
  @IsString()
  symptoms?: string;

  // --- PATIENT DETAILS (Optional) ---
  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Tên bệnh nhân' })
  @IsOptional()
  @IsString()
  patient_name?: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Số điện thoại bệnh nhân' })
  @IsOptional()
  @IsString()
  patient_phone?: string;

  @ApiPropertyOptional({ example: 'Nam', description: 'Giới tính' })
  @IsOptional()
  @IsString()
  patient_gender?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  patient_dob?: string;

  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  patient_address?: string;

  @ApiPropertyOptional({ example: 'Vợ/Chồng', description: 'Mối quan hệ' })
  @IsOptional()
  @IsString()
  relationship?: string;
  // --- PAYMENT METHOD (Optional) ---
  @ApiPropertyOptional({
    example: 'cash',
    description: 'Phương thức thanh toán (cash, vnpay, payos)',
  })
  @IsOptional()
  @IsString()
  payment_method?: string;
}
