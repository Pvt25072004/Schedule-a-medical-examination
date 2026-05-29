import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { HospitalRegistrationsService } from './hospital-registrations.service';
import {
  CreateHospitalRegistrationDto,
  SubmitHospitalRegistrationDto,
  VerifyOtpDto,
} from './dto/create-hospital-registration.dto';
import { UpdateHospitalRegistrationStatusDto } from './dto/update-hospital-registration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hospital-registrations')
export class HospitalRegistrationsController {
  constructor(
    private readonly registrationsService: HospitalRegistrationsService,
  ) {}

  // --- Guest Endpoints (No Auth Required) ---

  @Post('init')
  initRegistration(@Body() dto: CreateHospitalRegistrationDto) {
    return this.registrationsService.initRegistration(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.registrationsService.verifyOtp(dto);
  }

  @Post(':id/submit')
  submitRegistration(
    @Param('id') id: string,
    @Body() dto: SubmitHospitalRegistrationDto,
  ) {
    return this.registrationsService.submitRegistration(+id, dto);
  }

  // --- Admin Endpoints (Require Auth & Role 'admin') ---

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.registrationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateHospitalRegistrationStatusDto,
  ) {
    return this.registrationsService.updateStatus(+id, dto);
  }
}
