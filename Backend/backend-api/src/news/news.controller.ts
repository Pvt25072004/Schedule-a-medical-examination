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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { NewsService } from './news.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Controller('admin/news')
export class AdminNewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadNewsImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File phải là hình ảnh');
    }

    const result = await this.cloudinaryService.uploadImage(
      file,
      'clinic/news',
    );

    return {
      image_url: result.secure_url,
      image_public_id: result.public_id,
    };
  }

  @Post()
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @Get()
  findAllAdmin() {
    return this.newsService.findAllAdmin();
  }

  @Get(':id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOneAdmin(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}

@Controller('news')
export class PublicNewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findPublicNews() {
    return this.newsService.findPublicNews();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }
}
