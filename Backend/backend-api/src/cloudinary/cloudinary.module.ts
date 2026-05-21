import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/banner/entities/banner.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';

@Module({
  // controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
