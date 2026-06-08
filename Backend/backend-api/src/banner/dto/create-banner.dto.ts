import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  image_url: string;

  @IsString()
  @IsOptional()
  image_public_id?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  redirect_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  category_id?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  doctor_id?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  hospital_id?: number;
}
