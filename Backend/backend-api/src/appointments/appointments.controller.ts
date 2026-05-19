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
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
// 1. Import thư viện Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  // ApiBody,
} from '@nestjs/swagger';
import { Appointment } from './entities/appointment.entity';

@ApiTags('Appointments') // 2. Gom nhóm các API này vào thẻ "Appointments"
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Tạo lịch hẹn mới' }) // Mô tả chức năng
  @ApiResponse({
    status: 201,
    description: 'Tạo lịch hẹn thành công.',
    type: Appointment, // Cho Swagger biết dữ liệu trả về là Entity Appointment
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả lịch hẹn' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch hẹn.',
    type: [Appointment], // Trả về mảng []
  })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn theo bệnh nhân' })
  findByUser(@Param('userId') userId: string) {
    return this.appointmentsService.findByUser(+userId);
  }

  @Get('/doctor/:doctorId')
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn theo bác sĩ' })
  findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findByDoctor(+doctorId, date);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Lấy chi tiết một lịch hẹn' })
  @ApiParam({
    name: 'id',
    description: 'ID của lịch hẹn (số nguyên)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tìm thấy lịch hẹn.',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch hẹn.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin lịch hẹn' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch hẹn.' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Patch('/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái lịch hẹn (bác sĩ / hệ thống)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(
      +id,
      updateStatusDto.status,
      updateStatusDto.reason,
    );
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Xóa lịch hẹn' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch hẹn.' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
