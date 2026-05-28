import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FanpagesService } from './fanpages.service';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import type { Express } from 'express';

@Controller('fanpages')
export class FanpagesController {
  constructor(
    private readonly fanpagesService: FanpagesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  create(@Body() createFanpageDto: CreateFanpageDto) {
    return this.fanpagesService.create(createFanpageDto);
  }

  @Get()
  findAll() {
    return this.fanpagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fanpagesService.findOne(+id);
  }

  @Get('hospital/:hospital_id')
  findByHospitalId(@Param('hospital_id') hospital_id: string) {
    return this.fanpagesService.findByHospitalId(+hospital_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFanpageDto: UpdateFanpageDto) {
    return this.fanpagesService.update(+id, updateFanpageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fanpagesService.remove(+id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFanpageImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File phải là hình ảnh');
    }

    const result = await this.cloudinaryService.uploadImage(
      file,
      'clinic/fanpages',
    );

    return {
      image_url: result.secure_url,
      image_public_id: result.public_id,
    };
  }
}
