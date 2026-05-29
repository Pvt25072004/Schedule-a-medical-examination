import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalRegistrationsService } from './hospital-registrations.service';
import { HospitalRegistrationsController } from './hospital-registrations.controller';
import { HospitalRegistration } from './entities/hospital-registration.entity';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { HospitalsModule } from '../hospitals/hospitals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HospitalRegistration]),
    EmailModule,
    UsersModule,
    HospitalsModule,
  ],
  controllers: [HospitalRegistrationsController],
  providers: [HospitalRegistrationsService],
  exports: [HospitalRegistrationsService],
})
export class HospitalRegistrationsModule {}
