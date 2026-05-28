import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateDoctorHospitalRequestDto {
  @IsNumber()
  doctor_id: number;

  @IsNumber()
  hospital_id: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(['join', 'leave'])
  @IsOptional()
  type?: string;
}

export class UpdateDoctorHospitalRequestDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  status: string;
}
