import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class SocialLoginDto {
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Provider không được để trống' })
  @IsIn(['google', 'facebook'], {
    message: 'Provider phải là google hoặc facebook',
  })
  provider: 'google' | 'facebook';
}
