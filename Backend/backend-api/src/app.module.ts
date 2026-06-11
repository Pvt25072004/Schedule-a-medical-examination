import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorsModule } from './doctors/doctors.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { FirebaseService } from './firebase/firebase.service';
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';
import { PricingModule } from './pricing/pricing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BannerModule } from './banner/banner.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FanpagesModule } from './fanpages/fanpages.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { NewsModule } from './news/news.module';
import { HospitalRegistrationsModule } from './hospital-registrations/hospital-registrations.module';
import { AiModule } from './ai/ai.module';
import { DoctorHospitalRequestsModule } from './doctor-hospital-requests/doctor-hospital-requests.module';
import { ServicePackagesModule } from './service-packages/service-packages.module';
import { CitiesModule } from './cities/cities.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // OTP deals with time-sensitive data
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 minutes
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '3306', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    DoctorsModule,
    HospitalsModule,
    UsersModule,
    AppointmentsModule,
    PaymentsModule,
    ReviewsModule,
    SchedulesModule,
    CategoriesModule,
    AuthModule,
    EmailModule,
    PricingModule,
    NotificationsModule,
    BannerModule,
    CloudinaryModule,
    FanpagesModule,
    PostsModule,
    LikesModule,
    CommentsModule,
    NewsModule,
    HospitalRegistrationsModule,
    AiModule,
    DoctorHospitalRequestsModule,
    ServicePackagesModule,
    CitiesModule,
    LeaveRequestsModule,
    MedicalRecordsModule,
    DashboardModule,
    RoomsModule,
  ],
  controllers: [AppController, EmailController],
  providers: [
    AppService,
    FirebaseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
