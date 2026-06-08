import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/doctors/doctor.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Banner } from './entities/banner.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forFeature([Banner, Category, Doctor, Hospital]),
    CloudinaryModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
