import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsInt()
  hospital_id: number;

  @IsOptional()
  @IsInt()
  category_id?: number;
}
