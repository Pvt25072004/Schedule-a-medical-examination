import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsEnum(['pending', 'confirmed', 'checked_in', 'cancelled', 'completed', 'rejected'])
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  refund_bank_name?: string;

  @IsString()
  @IsOptional()
  refund_bank_account?: string;

  @IsString()
  @IsOptional()
  refund_account_name?: string;
}


