import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  Matches,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  doctor_id: number;

  @IsInt()
  @IsNotEmpty()
  hospital_id: number;

  @IsInt()
  @IsNotEmpty()
  schedule_id: number;

  @IsDateString()
  @IsNotEmpty()
  appointment_date: string;

  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Thời gian hẹn không hợp lệ (HH:mm)',
  })
  appointment_time: string;

  @IsEnum(['online', 'offline'])
  @IsNotEmpty()
  examination_type: string;

  @IsOptional()
  @IsString()
  symptoms?: string;
}
