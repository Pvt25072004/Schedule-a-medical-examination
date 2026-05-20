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

  // Gửi thông báo đẩy qua FCM
  async sendPushNotification(fcmToken: string, title: string, body: string, data?: any) {
    if (!fcmToken) {
      console.warn('⚠️ Không thể gửi thông báo đẩy: FCM Token rỗng.');
      return;
    }
    if (!this._admin) {
      console.warn('⚠️ Firebase Admin SDK chưa được khởi tạo.');
      return;
    }
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            vibrateTimingsMillis: [0, 500, 200, 500], // Rung 2 nhịp chuyên nghiệp
            channelId: 'high_importance_channel', // Kênh có độ ưu tiên cao để kích hoạt rung/chuông trên Android
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        data: data ? Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}) : {},
      };
      const response = await this._admin.messaging().send(message);
      console.log('✅ Đã gửi thành công thông báo đẩy FCM (có âm thanh/rung):', response);
      return response;
    } catch (error) {
      console.error('🔥 Lỗi khi gửi thông báo đẩy FCM:', error);
    }
  }
}
