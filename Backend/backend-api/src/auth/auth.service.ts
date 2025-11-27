import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    // DTOs are validated by class-validator, safe to use
    // TypeScript strict mode may show false positives for validated DTOs
    const dto = registerDto as unknown as {
      email: string;
      phone: string;
      password: string;
      full_name: string;
      date_of_birth: string;
      gender: string;
      address?: string;
    };
    const email = dto.email;
    const phone = dto.phone;
    const password = dto.password;
    const full_name = dto.full_name;
    const date_of_birth = dto.date_of_birth;
    const gender = dto.gender;
    const address = dto.address || '';

    // Check if user already exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const existingUserByEmail = await this.usersService.findByEmail(email);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const existingUserByPhone = await this.usersService.findByPhone(phone);

    if (existingUserByEmail || existingUserByPhone) {
      throw new HttpException(
        'Email hoặc số điện thoại đã được sử dụng',
        HttpStatus.CONFLICT,
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(String(password), 10);

    // Create user in database
    const user = await this.usersService.create({
      full_name,
      email,
      phone,
      password_hash: passwordHash,
      date_of_birth,
      gender,
      address,
    });

    if (!user?.id || !user?.email) {
      throw new HttpException(
        'Lỗi tạo tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  async login(loginDto: LoginDto) {
    // DTOs are validated by class-validator, safe to use
    // TypeScript strict mode may show false positives for validated DTOs
    const dto = loginDto as unknown as { email: string; password: string };
    const email = dto.email;
    const password = dto.password;

    // Find user by email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const user = (await this.usersService.findByEmail(email)) as User | null;

    if (!user?.id || !user?.email || !user?.password_hash) {
      throw new HttpException(
        'Email hoặc mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new HttpException(
        'Email hoặc mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  // === THÊM LOGIC MỚI VÀO ĐÂY ===

  async requestReset(email: string) {
    if (!email) {
      throw new HttpException('Thiếu email', HttpStatus.BAD_REQUEST);
    }

    // 1. Kiểm tra user tồn tại trong database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const user = (await this.usersService.findByEmail(email)) as User | null;
    if (!user) {
      throw new HttpException('Không tìm thấy tài khoản', HttpStatus.NOT_FOUND);
    }

    // 2. Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Lưu OTP vào Cache, tự hết hạn sau 5 phút
    await this.cacheManager.set(email, otp, 5 * 60 * 1000);

    // 4. Gửi email bằng EmailService
    await this.emailService.sendOtpEmail(email, otp);

    console.log(`OTP cho ${email}: ${otp}`);
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

    // 2. Tìm user và cập nhật mật khẩu trong database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const user = (await this.usersService.findByEmail(email)) as User | null;
    if (!user?.id) {
      throw new HttpException('Không tìm thấy tài khoản', HttpStatus.NOT_FOUND);
    }

    try {
      // Hash password mới
      const passwordHash = await bcrypt.hash(newPassword, 10);
      // UpdateUserDto may not include password_hash, but it's valid for entity
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.usersService.update(user.id, {
        password_hash: passwordHash,
      } as any);

      // 3. Xóa OTP khỏi cache
      await this.cacheManager.del(email);
    } catch (error) {
      // Nếu là HttpException thì re-throw, không thì throw lỗi mới
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Lỗi đổi mật khẩu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
