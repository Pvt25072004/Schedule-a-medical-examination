import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsInt()
  @IsNotEmpty()
  appointment_id: number;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
