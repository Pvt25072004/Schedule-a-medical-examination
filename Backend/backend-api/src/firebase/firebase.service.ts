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
      throw new Error('GOOGLE_CREDENTIALS is not defined in .env');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    this._admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: this.configService.get<string>('DATABASE_URL'),
    });
  }

  // Cung cấp Firebase auth() cho các service khác
  get auth() {
    return this._admin.auth();
  }
}
