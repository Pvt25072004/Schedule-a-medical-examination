import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { SocialService } from './social.service';
import {
  HospitalAdminSocialController,
  PublicSocialController,
} from './social.controller';

import { SocialPost } from './entities/social-post.entity';
import { SocialLike } from './entities/social-like.entity';
import { SocialComment } from './entities/social-comment.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { User } from 'src/users/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forFeature([
      SocialPost,
      SocialLike,
      SocialComment,
      Hospital,
      User,
    ]),
    CloudinaryModule,
  ],
  controllers: [HospitalAdminSocialController, PublicSocialController],
  providers: [SocialService],
})
export class SocialModule {}
