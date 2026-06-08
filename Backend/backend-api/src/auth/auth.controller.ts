import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-registration-otp')
  @HttpCode(HttpStatus.OK)
  async sendRegistrationOtp(@Body('email') email: string) {
    try {
      await this.authService.sendRegistrationOtp(email);
      return { success: true, message: 'Mã OTP đã được gửi về email' };
    } catch (error) {
      throw error;
    }
  }

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

  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    return await this.authService.socialLogin(socialLoginDto);
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

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const user = req.user as { id?: number } | undefined;
    const userId = user?.id;
    return this.authService.changePassword(
      Number(userId),
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
