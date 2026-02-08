import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsEnum(['pending', 'confirmed', 'cancelled', 'completed', 'rejected'])
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}


