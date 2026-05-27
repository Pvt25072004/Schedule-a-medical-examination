import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DoctorsModule } from '../doctors/doctors.module';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [DoctorsModule, HospitalsModule, AppointmentsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
