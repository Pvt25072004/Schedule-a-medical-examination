import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('request-reset')
  @HttpCode(HttpStatus.OK)
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    try {
      await this.authService.requestReset(requestResetDto.email);
      return { success: true, message: 'OTP đã gửi về email' };
    } catch (error) {
      // Service sẽ ném lỗi, chúng ta bắt lại và trả về
      throw error;
    }
  }

  @Post('verify-reset')
  @HttpCode(HttpStatus.OK)
  async verifyReset(@Body() verifyResetDto: VerifyResetDto) {
    try {
      await this.authService.verifyReset(
        verifyResetDto.email,
        verifyResetDto.otp,
        verifyResetDto.newPassword,
      );
      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      throw error;
    }
  }
}
