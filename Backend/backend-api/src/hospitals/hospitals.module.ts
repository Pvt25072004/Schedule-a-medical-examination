import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { Hospital } from './entities/hospital.entity';
import { SpecialtiesModule } from 'src/specialties/specialties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hospital]),
    SpecialtiesModule,
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}
