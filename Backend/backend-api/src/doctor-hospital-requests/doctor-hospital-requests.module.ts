import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorHospitalRequestsController } from './doctor-hospital-requests.controller';
import { DoctorHospitalRequestsService } from './doctor-hospital-requests.service';
import { DoctorHospitalRequest } from './entities/doctor-hospital-request.entity';
import { Doctor } from '../doctors/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorHospitalRequest, Doctor])],
  controllers: [DoctorHospitalRequestsController],
  providers: [DoctorHospitalRequestsService],
  exports: [DoctorHospitalRequestsService],
})
export class DoctorHospitalRequestsModule {}
