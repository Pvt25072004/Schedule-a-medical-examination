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
  Query,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      // Nếu vì lý do nào đó không có email trong JWT, không tìm được hồ sơ
      return null;
    }
    return this.doctorsService.findByEmail(user.email);
  }
  
  @Get('top-rated') // GET /doctors/top-rated
  findTopRated() {
    return this.doctorsService.findTopRated();
  }

  @Get() // GET /doctors
  findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('date') date?: string,
    @Query('time') time?: string,
  ) {
    return this.doctorsService.findAll(
      hospitalId ? +hospitalId : undefined,
      categoryId ? +categoryId : undefined,
      date,
      time,
    );
  }

  @Get(':id') // GET /doctors/1
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.doctorsService.toggleActive(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateDoctorProfileDto) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      return null;
    }
    return this.doctorsService.updateProfileByEmail(user.email, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }
}
