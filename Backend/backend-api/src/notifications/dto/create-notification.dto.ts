import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  type?: string;
}
