import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^[0-9]{10,11}$/)
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  avatar_public_id?: string;

  @IsInt()
  @IsOptional()
  category_id?: number;

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

  @IsInt()
  @IsNotEmpty()
  hospital_id: number;
}
