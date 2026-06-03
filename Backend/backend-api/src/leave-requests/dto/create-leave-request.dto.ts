import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsInt()
  doctor_id: number;

  @IsDateString()
  leave_date: string; // ISO yyyy-mm-dd

  @IsString()
  @IsNotEmpty()
  reason: string;
}
