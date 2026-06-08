import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsEnum(['pending', 'confirmed', 'checked_in', 'cancelled', 'completed', 'rejected'])
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}


