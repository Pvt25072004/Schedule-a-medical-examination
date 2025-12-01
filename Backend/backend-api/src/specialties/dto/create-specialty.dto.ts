import { IsString, IsNotEmpty, IsOptional, MaxLength} from "class-validator";

export class CreateSpecialtyDto {
  @IsString({ message: 'Tên chuyên khoa phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên chuyên khoa không được để trống' })
  @MaxLength(150, { message: 'Tên chuyên khoa không được vượt quá 150 ký tự' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;
}