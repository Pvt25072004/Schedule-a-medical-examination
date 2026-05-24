import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FanpagesService } from './fanpages.service';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';

@Controller('fanpages')
export class FanpagesController {
  constructor(private readonly fanpagesService: FanpagesService) {}

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
}
