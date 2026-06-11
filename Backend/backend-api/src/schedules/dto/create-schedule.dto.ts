import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @IsOptional()
  @IsInt()
  doctor_id?: number;

  @IsOptional()
  doctor_ids?: number[];

  @IsOptional()
  @IsBoolean()
  apply_to_all_doctors?: boolean;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsInt()
  hospital_id: number;

  @IsDateString()
  work_date: string; // ISO date string (yyyy-mm-dd)

  @IsOptional()
  @IsDateString()
  end_date?: string; // Optional end date for bulk creation

  @IsString()
  start_time: string; // HH:mm:ss

  @IsString()
  end_time: string; // HH:mm:ss

  @IsOptional()
  @IsInt()
  room_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_patients?: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @IsString()
  approval_status?: string;
}
