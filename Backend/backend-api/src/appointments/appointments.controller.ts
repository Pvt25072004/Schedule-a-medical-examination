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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo lịch hẹn mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công', type: Appointment })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn' })
  @ApiResponse({ status: 200, type: [Appointment] })
  findAll(@Query('userId') userId?: string, @Query('doctorId') doctorId?: string) {
    if (userId) return this.service.findByUser(+userId);
    if (doctorId) return this.service.findByDoctor(+doctorId);
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lịch hẹn' })
  @ApiParam({ name: 'id', description: 'ID lịch hẹn', example: 1 })
  @ApiResponse({ status: 200, type: Appointment })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin lịch hẹn' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: Appointment })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái lịch hẹn' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: Appointment })
  updateStatus(@Param('id') id: string, @Body('status') status: Appointment['status']) {
    return this.service.updateStatus(+id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa lịch hẹn' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
