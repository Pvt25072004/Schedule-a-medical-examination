import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  private serviceId: string | undefined;
  private templateId: string | undefined;
  private publicKey: string | undefined;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    // Load các key từ .env
    this.serviceId = this.configService.get<string>('EMAILJS_SERVICE_ID');
    this.templateId = this.configService.get<string>('EMAILJS_TEMPLATE_ID');
    this.publicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
  }

  async sendOtpEmail(email: string, otp: string) {
    const payload = {
      service_id: this.serviceId,
      template_id: this.templateId,
      user_id: this.publicKey,
      template_params: {
        to_email: email,
        otp: otp,
        name: 'STL - Clinic Booking',
      },
    };

    try {
      const url = 'https://api.emailjs.com/api/v1.0/email/send';
      // Chờ đợi request hoàn thành
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost', // Bạn có thể thay đổi cái này
          },
        }),
      );
    } catch (error) {
      console.error(error.response?.data);
      throw new Error('Gửi OTP thất bại');
    }
  }
}
