import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  full_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10,11}$/)
  phone?: string;

  @IsString()
  @IsOptional()
  password_hash?: string;

  @IsString()
  @IsOptional()
  provider_id?: string;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: string;

  @IsEnum(['local', 'google', 'facebook'])
  @IsOptional()
  auth_provider?: string;

  @IsOptional()
  is_email_verified?: boolean;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  id_card_number?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  avatar_public_id?: string;

  @IsString()
  @IsOptional()
  id_card_front_url?: string;

  @IsString()
  @IsOptional()
  id_card_front_public_id?: string;

  @IsString()
  @IsOptional()
  id_card_back_url?: string;

  @IsString()
  @IsOptional()
  id_card_back_public_id?: string;

  @IsEnum(['patient', 'doctor', 'admin'])
  @IsOptional()
  role?: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  is_welcome?: boolean;
}
