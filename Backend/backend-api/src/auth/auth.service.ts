import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FirebaseService } from '../firebase/firebase.service'; // <-- Import
import { EmailService } from '../email/email.service'; // <-- Import

@Injectable()
export class AuthService {
  // Tiêm (Inject) các service cần thiết vào constructor
  constructor(
    private firebaseService: FirebaseService,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ... các service khác của bạn (UsersService, JwtService...)
  ) {}

  // ... các hàm login, register... của bạn ở đây

  // === THÊM LOGIC MỚI VÀO ĐÂY ===

  async requestReset(email: string) {
    if (!email) {
      throw new HttpException('Thiếu email', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1. Kiểm tra user tồn tại bằng FirebaseService
      await this.firebaseService.auth.getUserByEmail(email);

      // 2. Tạo OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Lưu OTP vào Cache (thay thế Map), tự hết hạn
      await this.cacheManager.set(email, otp);

      // 4. Gửi email bằng EmailService
      await this.emailService.sendOtpEmail(email, otp);

      console.log(`OTP cho ${email}: ${otp}`);
      // Không cần return gì cả, controller sẽ xử lý
    } catch (error) {
      // Lỗi từ Firebase (không tìm thấy user)
      throw new HttpException('Không tìm thấy tài khoản', HttpStatus.NOT_FOUND);
    }
  }

  async verifyReset(email: string, otp: string, newPassword: string) {
    if (!email || !otp || !newPassword) {
      throw new HttpException('Thiếu thông tin', HttpStatus.BAD_REQUEST);
    }

    // 1. Lấy OTP từ cache
    const savedOtp = await this.cacheManager.get<string>(email);

    if (savedOtp !== otp) {
      throw new HttpException('OTP sai hoặc hết hạn', HttpStatus.BAD_REQUEST);
    }

    // 2. Cập nhật mật khẩu bằng FirebaseService
    try {
      const user = await this.firebaseService.auth.getUserByEmail(email);
      await this.firebaseService.auth.updateUser(user.uid, {
        password: newPassword,
      });

      // 3. Xóa OTP khỏi cache
      await this.cacheManager.del(email);

      // Không cần return, controller sẽ xử lý
    } catch (error) {
      throw new HttpException(
        'Lỗi đổi mật khẩu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
