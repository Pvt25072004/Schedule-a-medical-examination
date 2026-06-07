import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  // Admin: tạo bệnh viện mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateHospitalDto) {
    return this.hospitalsService.create(dto);
  }

  // Admin + public: xem danh sách bệnh viện
  @Get()
  findAll(@Query('city') city?: string) {
    return this.hospitalsService.findAll(city);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(+id);
  }

  // Admin, Admin Hospital: cập nhật thông tin bệnh viện
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  update(@Param('id') id: string, @Body() dto: UpdateHospitalDto, @Req() req: any) {
    if (req.user.role === 'admin_hospital' && req.user.hospital_id !== +id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật bệnh viện khác');
    }
    return this.hospitalsService.update(+id, dto);
  }

  // Admin: xóa bệnh viện
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.hospitalsService.remove(+id);
  }
}
