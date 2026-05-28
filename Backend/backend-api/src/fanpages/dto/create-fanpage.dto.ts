import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateFanpageDto {
  @IsNumber()
  @IsNotEmpty()
  hospital_id: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  cover_image_url?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  cover_public_id?: string;

  @IsString()
  @IsOptional()
  avatar_public_id?: string;
}
