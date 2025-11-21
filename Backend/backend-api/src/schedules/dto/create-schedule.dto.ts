import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  Matches,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @IsNotEmpty()
  doctor_id!: number;

  @IsInt()
  @IsNotEmpty()
  hospital_id!: number;

  @IsDateString()
  @IsNotEmpty()
  work_date!: string;

  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Thời gian bắt đầu không hợp lệ (HH:mm)',
  })
  start_time: string;

  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Thời gian kết thúc không hợp lệ (HH:mm)',
  })
  end_time: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  max_patients?: number;

  @IsOptional()
  is_available?: boolean;
}
