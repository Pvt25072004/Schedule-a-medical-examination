import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('me')
  getMe(@Req() req: any) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      // Nếu vì lý do nào đó không có email trong JWT, không tìm được hồ sơ
      return null;
    }
    return this.doctorsService.findByEmail(user.email);
  }

  @Get() // GET /doctors
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id') // GET /doctors/1
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.doctorsService.toggleActive(+id);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateDoctorProfileDto) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      return null;
    }
    return this.doctorsService.updateProfileByEmail(user.email, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }
}
