import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { Hospital } from './entities/hospital.entity';
import { Category } from 'src/categories/entities/category.entity';
import { City } from 'src/cities/entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital, Category, City])],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}
