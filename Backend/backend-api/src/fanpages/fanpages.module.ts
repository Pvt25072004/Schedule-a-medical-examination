import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FanpagesService } from './fanpages.service';
import { FanpagesController } from './fanpages.controller';
import { Fanpage } from './entities/fanpage.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fanpage, Hospital])],
  controllers: [FanpagesController],
  providers: [FanpagesService],
  exports: [FanpagesService],
})
export class FanpagesModule {}
