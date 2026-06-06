import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { ServicePackagesService } from './service-packages.service';

@Controller('service-packages')
export class ServicePackagesController {
  constructor(private readonly servicePackagesService: ServicePackagesService) {}

  @Get()
  findAll() {
    return this.servicePackagesService.findAll();
  }

  @Get('popular')
  findPopular() {
    return this.servicePackagesService.findPopular();
  }

  @Post()
  create(@Body() data: any) {
    return this.servicePackagesService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicePackagesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.servicePackagesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicePackagesService.remove(+id);
  }
}
