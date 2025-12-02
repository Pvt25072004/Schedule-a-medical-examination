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
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,11}$/)
  phone: string;

  @IsString()
  @IsOptional()
  password_hash?: string;

  @IsString()
  @IsOptional()
  firebase_uid?: string;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsEnum(['male', 'female', 'other'])
  @IsNotEmpty()
  gender: string;

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
  id_card_front_url?: string;

  @IsString()
  @IsOptional()
  id_card_back_url?: string;

  @IsEnum(['patient', 'doctor', 'admin'])
  @IsOptional()
  role?: string;

  @IsOptional()
  is_active?: boolean;
}
