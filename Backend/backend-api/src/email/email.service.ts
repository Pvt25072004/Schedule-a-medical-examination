import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  private serviceId: string | undefined;
  private templateId: string | undefined;
  private doctorTemplateId: string | undefined;
  private publicKey: string | undefined;
  private frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    // Load các key từ .env
    this.serviceId = this.configService.get<string>('EMAILJS_SERVICE_ID');
    this.templateId = this.configService.get<string>('EMAILJS_TEMPLATE_ID');
    // Nếu chưa cấu hình template riêng cho bác sĩ thì tạm dùng template OTP
    this.doctorTemplateId = this.configService.get<string>('EMAILJS_DOCTOR_TEMPLATE_ID') || this.templateId;
    this.publicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
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

  async sendDoctorCredentialsEmail(email: string, passw: string, name: string) {
    const payload = {
      service_id: this.serviceId,
      template_id: this.doctorTemplateId,
      user_id: this.publicKey,
      template_params: {
        to_email: email,
        message: 'Tài khoản Bác sĩ của bạn đã được khởi tạo thành công. Vui lòng sử dụng thông tin dưới đây để đăng nhập vào hệ thống. Vui lòng không cung cấp mật khẩu này cho bất kì ai khác hoặc bạn có thể thay đổi mật khẩu sau khi đăng nhập.',
        password: passw,
        name: name,
        login_url: `${this.frontendUrl}/login`,
      },
    };

    try {
      const url = 'https://api.emailjs.com/api/v1.0/email/send';
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost',
          },
        }),
      );
    } catch (error) {
      console.error(error.response?.data);
      throw new Error('Gửi Email thông tin đăng nhập thất bại');
    }
  }

  async sendDoctorApplicationApprovedEmail(email: string, name: string, hospitalName: string) {
    const payload = {
      service_id: this.serviceId,
      template_id: this.doctorTemplateId,
      user_id: this.publicKey,
      template_params: {
        to_email: email,
        message: `Chúc mừng bạn đã được chấp thuận liên kết với Bệnh viện ${hospitalName}. Bạn đã có thể bắt đầu tiếp nhận lịch khám.`,
        password: '',
        name: name,
        login_url: `${this.frontendUrl}/login`,
      },
    };

    try {
      const url = 'https://api.emailjs.com/api/v1.0/email/send';
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost',
          },
        }),
      );
    } catch (error) {
      console.error('Gửi email thông báo thất bại:', error);
    }
  }

  async sendDoctorUnlinkedEmail(email: string, name: string, hospitalName: string, reason: string) {
    const payload = {
      service_id: this.serviceId,
      template_id: this.doctorTemplateId,
      user_id: this.publicKey,
      template_params: {
        to_email: email,
        message: `Bệnh viện ${hospitalName} đã hủy liên kết với bạn.\nLý do: ${reason}`,
        password: '',
        name: name,
        login_url: `${this.frontendUrl}/login`,
      },
    };

    try {
      const url = 'https://api.emailjs.com/api/v1.0/email/send';
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost',
          },
        }),
      );
    } catch (error) {
      console.error('Gửi email thông báo hủy liên kết thất bại:', error);
    }
  }

  async sendRejectionEmail(email: string, name: string, reason: string) {
    const payload = {
      service_id: this.serviceId,
      template_id: this.doctorTemplateId,
      user_id: this.publicKey,
      template_params: {
        to_email: email,
        message: `Rất tiếc, đơn đăng ký của bạn đã bị từ chối.\nLý do: ${reason}`,
        password: '',
        name: name,
        login_url: `${this.frontendUrl}/login`,
      },
    };

    try {
      const url = 'https://api.emailjs.com/api/v1.0/email/send';
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost',
          },
        }),
      );
    } catch (error) {
      console.error('Gửi email từ chối thất bại:', error);
    }
  }
}
