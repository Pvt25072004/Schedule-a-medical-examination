import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { DoctorHospitalRequestsService } from './doctor-hospital-requests.service';
import { CreateDoctorHospitalRequestDto, UpdateDoctorHospitalRequestDto } from './dto/doctor-hospital-request.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('doctor-hospital-requests')
@UseGuards(JwtAuthGuard)
export class DoctorHospitalRequestsController {
  constructor(private readonly requestsService: DoctorHospitalRequestsService) {}

  @Post()
  create(@Body() dto: CreateDoctorHospitalRequestDto) {
    return this.requestsService.create(dto);
  }

  @Get('hospital/:id')
  findAllByHospital(@Param('id') hospitalId: string) {
    return this.requestsService.findAllByHospital(+hospitalId);
  }

  @Get('doctor/:id')
  findAllByDoctor(@Param('id') doctorId: string) {
    return this.requestsService.findAllByDoctor(+doctorId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDoctorHospitalRequestDto) {
    return this.requestsService.updateStatus(+id, dto);
  }
}
