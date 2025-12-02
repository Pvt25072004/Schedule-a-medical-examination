import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  doctor_id: number;

  @IsInt()
  hospital_id: number;

  @IsDateString()
  work_date: string; // ISO date string (yyyy-mm-dd)

  @IsString()
  start_time: string; // HH:mm:ss

  @IsString()
  end_time: string; // HH:mm:ss

  @IsOptional()
  @IsInt()
  @Min(1)
  max_patients?: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
