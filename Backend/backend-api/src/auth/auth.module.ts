import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service'; // <-- Import
import { EmailService } from '../email/email.service'; // <-- Import
// ... các import khác của bạn (JwtStrategy, UsersModule...)

@Module({
  imports: [
    HttpModule, // <-- Thêm HttpModule (cho axios)
    // ... các module khác của bạn (UsersModule, JwtModule...)
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseService, // <-- Đăng ký làm provider
    EmailService, // <-- Đăng ký làm provider
  ],
})
export class AuthModule {}
