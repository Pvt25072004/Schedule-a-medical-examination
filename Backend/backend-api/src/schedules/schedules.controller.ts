import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital', 'doctor')
  create(@Body() createScheduleDto: CreateScheduleDto, @Req() req: any) {
    return this.schedulesService.create(createScheduleDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  findAll(@Query('doctorId') doctorId?: string, @Req() req?: any) {
    if (doctorId) {
      return this.schedulesService.findByDoctor(+doctorId, req.user);
    }
    return this.schedulesService.findAll(req.user);
  }
  @Get('doctor/:doctorId')
  @UseGuards(JwtAuthGuard)
  findByDoctor(@Param('doctorId', ParseIntPipe) doctorId: number, @Req() req: any) {
    return this.schedulesService.findByDoctor(doctorId, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: any,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto, req.user);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.schedulesService.approve(+id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  updateStatus(@Param('id') id: string, @Body() body: { is_available: boolean }, @Req() req: any) {
    return this.schedulesService.updateStatus(+id, body.is_available, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.schedulesService.remove(+id, req.user);
  }
}
