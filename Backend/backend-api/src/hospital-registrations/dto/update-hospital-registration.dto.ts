import { IsEnum, IsOptional, IsString } from 'class-validator';
import { HospitalRegistrationStatus } from '../entities/hospital-registration.entity';

export class UpdateHospitalRegistrationStatusDto {
  @IsEnum(HospitalRegistrationStatus)
  status: HospitalRegistrationStatus;

  @IsOptional()
  @IsString()
  revision_notes?: string;

  @IsOptional()
  @IsString()
  internal_notes?: string;
}
