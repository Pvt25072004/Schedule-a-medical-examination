import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Column } from 'typeorm/browser/decorator/columns/Column.js';

export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,11}$/)
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  main_specialty?: string;

  @IsOptional()
  is_active?: boolean;

  @Type(() => Number)
  @IsNumber({},{ message: 'area_id phải là một số' })
  @IsNotEmpty({ message: 'area_id không được để trống' })
  @Min(1, { message: 'area_id phải lớn hơn hoặc bằng 1' })
  area_id: number;
}

