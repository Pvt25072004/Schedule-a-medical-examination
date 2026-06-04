import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiPropertyOptional({
    description: 'Lý do hủy/dời lịch',
  })
  cancel_reason?: string;

  @ApiPropertyOptional({
    example: 'completed',
    enum: ['none', 'requested', 'completed'],
    description: 'Cập nhật trạng thái hoàn tiền (Admin)',
  })
  @IsOptional()
  @IsString()
  refund_status?: string;
}
