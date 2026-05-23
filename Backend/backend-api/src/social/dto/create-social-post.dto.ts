import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSocialPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  image_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  image_public_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
