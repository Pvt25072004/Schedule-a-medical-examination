import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private emailService: EmailService,
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // 1. Tạo user trong Firebase Auth
      const firebaseUser = await this.firebaseService.auth.createUser({
        email: registerDto.email,
        password: registerDto.password,
        displayName: registerDto.full_name,
      });

      // 2. Tạo user trong database
      const user = await this.usersService.create({
        ...registerDto,
        password_hash: '', // Firebase xử lý password
        firebase_uid: firebaseUser.uid,
      });

      // 3. Tạo JWT token
      const payload = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        userId: user.id,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      };
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new HttpException(
          'Email đã được sử dụng',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Đăng ký thất bại',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // 1. Xác thực với Firebase
      // Note: Firebase Admin SDK không có method verifyPassword
      // Cần sử dụng Firebase Client SDK hoặc tạo custom token
      // Tạm thời sử dụng getUserByEmail và verify trong client
      const firebaseUser = await this.firebaseService.auth.getUserByEmail(
        loginDto.email,
      );

      // 2. Lấy user từ database
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Thông tin đăng nhập không đúng');
      }

      // 3. Tạo JWT token
      const payload = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        userId: user.id,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new UnauthorizedException('Thông tin đăng nhập không đúng');
      }
      throw new UnauthorizedException('Đăng nhập thất bại');
    }
  }

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
