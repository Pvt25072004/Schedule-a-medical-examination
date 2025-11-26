import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _admin: admin.app.App;

  constructor(private configService: ConfigService) {}

  // Khởi tạo Firebase khi module được load
  onModuleInit() {
    const serviceAccountJson =
      this.configService.get<string>('GOOGLE_CREDENTIALS');
    if (!serviceAccountJson) {
      // Không cấu hình Firebase thì bỏ qua, tránh làm crash toàn bộ app
      // Nếu service khác gọi FirebaseService.auth khi chưa init sẽ lỗi,
      // nhưng trong đồ án hiện tại bạn không dùng tới thì an toàn.
      // eslint-disable-next-line no-console
      console.warn(
        'GOOGLE_CREDENTIALS is not defined. Firebase will not be initialized.',
      );
      return;
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // FIX: kiểm tra nếu app tồn tại thì dùng lại
    if (admin.apps.length === 0) {
      this._admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: this.configService.get<string>('DATABASE_URL'),
      });
    } else {
      this._admin = admin.app();
    }
  }

  // Cung cấp Firebase auth() cho các service khác
  get auth() {
    return this._admin.auth();
  }
}
