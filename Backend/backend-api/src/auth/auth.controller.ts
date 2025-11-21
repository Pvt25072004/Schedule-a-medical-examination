import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
