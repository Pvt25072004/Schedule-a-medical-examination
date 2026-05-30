import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DoctorsModule } from '../doctors/doctors.module';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ServicePackagesModule } from '../service-packages/service-packages.module';

@Module({
  imports: [DoctorsModule, HospitalsModule, AppointmentsModule, ServicePackagesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
