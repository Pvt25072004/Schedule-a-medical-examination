import { forwardRef, Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Schedule]),
    forwardRef(() => SchedulesModule),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
