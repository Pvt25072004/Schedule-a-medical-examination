import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsInt()
  city_id?: number;

  @IsString()
  @Length(6, 20)
  phone: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  main_specialty?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  hospital_type?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
