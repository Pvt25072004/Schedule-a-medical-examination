import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDoctorApplicationDto {
  @IsInt()
  @IsNotEmpty()
  hospital_id: number;

  @IsString()
  @IsOptional()
  cover_letter?: string;

  @IsString()
  @IsOptional()
  type?: 'join' | 'leave';
}
