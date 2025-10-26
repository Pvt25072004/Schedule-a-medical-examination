import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}
