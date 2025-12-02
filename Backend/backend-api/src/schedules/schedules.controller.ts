import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  findAll(@Query('doctorId') doctorId?: string, @Query('date') date?: string) {
    if (doctorId && date) {
      return this.schedulesService.findByDoctorAndDate(
        +doctorId,
        new Date(date),
      );
    }
    return this.schedulesService.findAll();
  }

  @Get('available-doctors')
  findAvailableDoctors(
    @Query('specialtyId') specialtyId: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    return this.schedulesService.findAvailableDoctors(
      +specialtyId,
      date,
      time,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
}
