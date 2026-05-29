import { forwardRef, Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PricingModule } from '../pricing/pricing.module';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Schedule, Doctor, Hospital]),
    forwardRef(() => SchedulesModule),
    forwardRef(() => PaymentsModule),
    PricingModule,
    NotificationsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, FirebaseService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
