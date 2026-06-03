import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

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
      otp: string;
    };
    const email = dto.email;
    const phone = dto.phone;
    const password = dto.password;
    const full_name = dto.full_name;
    const date_of_birth = dto.date_of_birth;
    const gender = dto.gender;
    const address = dto.address || '';
    const otp = dto.otp;

    // Verify OTP first
    const savedOtp = await this.cacheManager.get<string>(`reg_otp_${email}`);
    if (!savedOtp || savedOtp !== otp) {
      throw new HttpException('Mã OTP không chính xác hoặc đã hết hạn', HttpStatus.BAD_REQUEST);
    }

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

    // Create user in database (role sẽ dùng default 'patient' từ UserEntity)
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
    const payload = { sub: user.id, email: user.email, role: user.role, hospital_id: user.hospital_id };
    const access_token = this.jwtService.sign(payload);

    // Xóa OTP khỏi cache
    await this.cacheManager.del(`reg_otp_${email}`);

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

    // Không cho đăng nhập nếu tài khoản bị tạm ngưng
    if (user.is_active === false) {
      throw new HttpException(
        'Tài khoản của bạn đang bị tạm ngưng, vui lòng liên hệ admin',
        HttpStatus.FORBIDDEN,
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
    const payload = { sub: user.id, email: user.email, role: user.role, hospital_id: user.hospital_id };
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

  async sendRegistrationOtp(email: string) {
    if (!email) {
      throw new HttpException('Thiếu email', HttpStatus.BAD_REQUEST);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new HttpException('Email đã được sử dụng', HttpStatus.CONFLICT);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheManager.set(`reg_otp_${email}`, otp, 5 * 60 * 1000);
    await this.emailService.sendOtpEmail(email, otp);
    console.log(`Registration OTP cho ${email}: ${otp}`);
  }

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

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    if (!userId) {
      throw new HttpException('Thiếu thông tin người dùng', HttpStatus.UNAUTHORIZED);
    }
    if (!currentPassword || !newPassword) {
      throw new HttpException('Thiếu mật khẩu', HttpStatus.BAD_REQUEST);
    }

    const user = (await this.usersService.findOne(userId)) as User | null;
    if (!user?.id || !user.password_hash) {
      throw new HttpException('Không tìm thấy tài khoản', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Mật khẩu hiện tại không đúng',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    return this.usersService.update(userId, { password_hash: newPasswordHash } as any);
  }

  // === SOCIAL LOGIN ===

  private async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid payload');
      return {
        email: payload.email || '',
        name: payload.name || 'User',
        picture: payload.picture,
        sub: payload.sub,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      throw new UnauthorizedException('Token Google không hợp lệ hoặc đã hết hạn');
    }
  }

  private async verifyFacebookToken(token: string) {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');

    if (!appId || !appSecret) {
      throw new HttpException('Thiếu cấu hình Facebook App', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // Lớp 1: Debug token để check xem có hợp lệ và thuộc về app của mình không
      const appAccessToken = `${appId}|${appSecret}`;
      const debugResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appAccessToken}`,
        ),
      );

      const debugData = debugResponse.data.data;
      if (!debugData || !debugData.is_valid || debugData.app_id !== appId) {
        throw new UnauthorizedException('Token Facebook không hợp lệ');
      }

      // Lớp 2: Lấy profile (id, name, email, picture)
      const profileResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`,
        ),
      );

      const profile = profileResponse.data;
      return {
        email: profile.email || ``, // No fake email fallback, keep empty string
        name: profile.name || 'User',
        picture: profile.picture?.data?.url,
        sub: profile.id,
        email_verified: !!profile.email, // FB đôi khi không cung cấp email
      };
    } catch (error) {
      throw new UnauthorizedException('Lỗi xác thực Facebook Token');
    }
  }

  async socialLogin(dto: SocialLoginDto) {
    let socialUser: {
      email: string;
      name: string;
      picture?: string;
      sub: string;
      email_verified?: boolean;
    };

    if (dto.provider === 'google') {
      socialUser = await this.verifyGoogleToken(dto.token);
    } else if (dto.provider === 'facebook') {
      socialUser = await this.verifyFacebookToken(dto.token);
    } else {
      throw new BadRequestException('Provider không được hỗ trợ');
    }

    // 1. Thử tìm user bằng email để Merge (Chỉ áp dụng an toàn cho Google có email_verified)
    // Hoặc Facebook nếu email verified
    if (socialUser.email && socialUser.email_verified) {
      let existingUser = await this.usersService.findByEmail(socialUser.email);
      if (existingUser) {
        // Cập nhật lại provider_id và auth_provider nếu đây là acc local
        if (existingUser.auth_provider === 'local') {
          existingUser = await this.usersService.update(existingUser.id, {
            auth_provider: dto.provider,
            provider_id: socialUser.sub,
            is_email_verified: true,
          } as any);
        }
        
        // Trả về token
        const payload = { sub: existingUser.id, email: existingUser.email, role: existingUser.role, hospital_id: existingUser.hospital_id };
        return {
          user: this.sanitizeUser(existingUser),
          access_token: this.jwtService.sign(payload),
        };
      }
    }

    // 2. Tìm theo Provider & ProviderID
    let user = await this.usersService.findByProvider(dto.provider, socialUser.sub);

    // 3. Nếu chưa có thì tạo mới
    if (!user) {
      // Create user cho phép email null nên ta pass email hoặc undefined nếu rỗng
      user = await this.usersService.create({
        email: socialUser.email || undefined,
        full_name: socialUser.name,
        avatar_url: socialUser.picture,
        auth_provider: dto.provider,
        provider_id: socialUser.sub,
        is_email_verified: socialUser.email_verified || false,
      } as any);
    }

    // Trả về token
    const payload = { sub: user.id, email: user.email, role: user.role, hospital_id: user.hospital_id };
    return {
      user: this.sanitizeUser(user),
      access_token: this.jwtService.sign(payload),
    };
  }

  private sanitizeUser(user: User) {
    const { password_hash, ...result } = user;
    return result;
  }
}
