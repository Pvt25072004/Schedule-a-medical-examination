import { Controller, Post, Body, Get, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Medical Records')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('doctor', 'admin')
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto, @Req() req: any) {
    return this.medicalRecordsService.create(createMedicalRecordDto, req.user);
  }

  @Get('my-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  findMyRecords(@Req() req: any) {
    return this.medicalRecordsService.findMyRecords(req.user);
  }

  @Get('appointment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  findByAppointment(@Param('appointmentId', ParseIntPipe) appointmentId: number, @Req() req: any) {
    return this.medicalRecordsService.findByAppointment(appointmentId, req.user);
  }
}
