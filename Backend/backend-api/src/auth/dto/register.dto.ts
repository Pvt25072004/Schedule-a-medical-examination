import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsDateString,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
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
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @IsEnum(['male', 'female', 'other'])
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

