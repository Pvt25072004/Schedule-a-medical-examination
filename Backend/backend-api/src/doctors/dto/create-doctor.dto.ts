import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { RelationIdDto } from 'src/common/dto/relation-id.dto';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
  avatar_url?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelationIdDto)
  specialties?: RelationIdDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelationIdDto)
  hospitals?: RelationIdDto[];
}
