import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Post('bulk')
  createBulk(@Body() createRoomDtos: CreateRoomDto[]) {
    if (!Array.isArray(createRoomDtos)) {
      throw new Error('Payload must be an array');
    }
    return this.roomsService.createBulk(createRoomDtos);
  }

  @Get()
  findAll(
    @Query('hospital_id') hospitalId?: string,
    @Query('category_id') categoryId?: string,
  ) {
    return this.roomsService.findAll(
      hospitalId ? +hospitalId : undefined,
      categoryId ? +categoryId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
