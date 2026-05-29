import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;

  @IsOptional()
  @IsString()
  avatar_public_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  hospitalIds?: number[];

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsInt()
  experience_years?: number;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsString()
  license_file?: string;

  @IsOptional()
  @IsString()
  certificate_file?: string;

  @IsOptional()
  @IsString()
  cv_file?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  old_password?: string;
}
