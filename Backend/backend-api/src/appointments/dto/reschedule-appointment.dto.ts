import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: 15, description: 'ID ca làm việc mới của bác sĩ' })
  @IsInt()
  schedule_id: number;

  @ApiProperty({ example: 5, description: 'ID bác sĩ mới' })
  @IsInt()
  doctor_id: number;

  @ApiProperty({ example: 3, description: 'ID bệnh viện' })
  @IsInt()
  hospital_id: number;

  @ApiProperty({ example: '2025-06-10', description: 'Ngày khám mới (YYYY-MM-DD)' })
  @IsDateString()
  appointment_date: string;

  @ApiProperty({ example: '09:30', description: 'Giờ khám mới (HH:mm)' })
  @IsString()
  appointment_time: string;

  @ApiPropertyOptional({ example: 'Bác sĩ Nguyễn Văn A', description: 'Tên bác sĩ mới (snapshot)' })
  @IsOptional()
  @IsString()
  doctor_name_snapshot?: string;

  @ApiPropertyOptional({ example: 'Bệnh viện Chợ Rẫy', description: 'Tên bệnh viện mới (snapshot)' })
  @IsOptional()
  @IsString()
  hospital_name_snapshot?: string;
}
