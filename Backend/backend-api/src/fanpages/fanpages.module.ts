import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FanpagesService } from './fanpages.service';
import { FanpagesController } from './fanpages.controller';
import { Fanpage } from './entities/fanpage.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';

import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fanpage, Hospital]),
    CloudinaryModule,
  ],
  controllers: [FanpagesController],
  providers: [FanpagesService],
  exports: [FanpagesService],
})
export class FanpagesModule {}
