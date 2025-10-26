import { Controller, Get, Param } from '@nestjs/common';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get() // GET /doctors
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id') // GET /doctors/1
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }
}
