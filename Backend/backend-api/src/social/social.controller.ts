import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';

import { SocialService } from './social.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';
import { CreateSocialCommentDto } from './dto/create-social-comment.dto';

@Controller('hospital-admin/social/posts')
export class HospitalAdminSocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadPostImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File phải là hình ảnh');
    }

    const result = await this.cloudinaryService.uploadImage(
      file,
      'clinic/social-posts',
    );

    return {
      image_url: result.secure_url,
      image_public_id: result.public_id,
    };
  }

  @Post()
  create(@Body() dto: CreateSocialPostDto, @Req() req: Request) {
    // Production: lấy từ token
    // const hospitalId = req.user.hospital_id;

    // Tạm thời test nếu chưa gắn auth:
    // const hospitalId = req.user.hospital_id;
    // const userId = req.user.id;
    const hospitalId = 1;

    return this.socialService.createHospitalPost(dto, hospitalId);
  }

  @Get()
  findHospitalPosts(@Req() req: Request) {
    // Production:
    // const hospitalId = req.user.hospital_id;

    const hospitalId = 1;

    return this.socialService.findHospitalPosts(hospitalId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialPostDto,
    @Req() req: Request,
  ) {
    // Production:
    // const hospitalId = req.user.hospital_id;

    const hospitalId = 1;

    return this.socialService.updateHospitalPost(id, dto, hospitalId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    // Production:
    // const hospitalId = req.user.hospital_id;

    const hospitalId = 1;

    return this.socialService.removeHospitalPost(id, hospitalId);
  }
}

@Controller('social/posts')
export class PublicSocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  findPublicPosts() {
    return this.socialService.findPublicPosts();
  }

  @Post(':id/like')
  toggleLike(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    // Production: lấy từ token patient
    // const userId = req.user.id;

    // Tạm thời test:
    // const hospitalId = req.user.hospital_id;
    // const userId = req.user.id;
    const userId = 1;

    return this.socialService.toggleLike(id, userId);
  }

  @Post(':id/comments')
  createComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSocialCommentDto,
    @Req() req: Request,
  ) {
    // Production:
    // const userId = req.user.id;

    const userId = 1;

    return this.socialService.createComment(id, userId, dto);
  }

  @Get(':id/comments')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.socialService.getComments(id);
  }

  @Post(':id/share')
  sharePost(@Param('id', ParseIntPipe) id: number) {
    return this.socialService.sharePost(id);
  }

  @Get(':id')
  findPublicPost(@Param('id', ParseIntPipe) id: number) {
    return this.socialService.findPublicPost(id);
  }
}
