import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAreaDto {
  // BẮT BUỘC: Thêm ít nhất một decorator xác thực
  @IsString({ message: 'Tên tỉnh thành phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Tên tỉnh thành không được để trống.' })
  @MaxLength(100, { message: 'Tên quá dài.' })
  name: string; 
}