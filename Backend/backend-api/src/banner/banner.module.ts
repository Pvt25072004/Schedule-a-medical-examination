import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/doctors/doctor.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, Category, Doctor])],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
