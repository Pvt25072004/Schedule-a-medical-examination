import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { News } from './entities/news.entity';
import { NewsService } from './news.service';
import { AdminNewsController, PublicNewsController } from './news.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forFeature([News]),
    CloudinaryModule,
  ],
  controllers: [AdminNewsController, PublicNewsController],
  providers: [NewsService],
})
export class NewsModule {}
