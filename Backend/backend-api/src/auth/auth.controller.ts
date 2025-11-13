import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestResetDto } from '../auth/dto/request-reset.dto'; // <-- Import DTO
import { VerifyResetDto } from '../auth/dto/verify-reset.dto'; // <-- Import DTO

// Controller này đã có @Controller('api/auth') hoặc @Controller('auth')
// Tôi giả sử là @Controller('api/auth')
@Controller('api/auth')
export class AuthController {
  // AuthService có sẵn của bạn được tiêm (inject) vào
  constructor(private authService: AuthService) {}

  // ... các route login, register... của bạn ở đây

  // === THÊM LOGIC MỚI VÀO ĐÂY ===

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
