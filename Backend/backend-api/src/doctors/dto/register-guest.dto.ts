import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterGuestDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsInt()
  @IsNotEmpty()
  hospital_id: number;

  @IsInt()
  @IsNotEmpty()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsInt()
  @IsOptional()
  experience_years?: number;

  @IsString()
  @IsOptional()
  license_number?: string;

  @IsString()
  @IsOptional()
  license_file?: string;

  @IsString()
  @IsOptional()
  certificate_file?: string;

  @IsString()
  @IsOptional()
  cv_file?: string;

  @IsString()
  @IsOptional()
  cover_letter?: string;
}
