import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
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


  @Get('available-times')
  async getAvailableTimes(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    if (!doctorId || !date) {
      throw new BadRequestException('Thiếu doctorId hoặc date');
    }
    return this.appointmentsService.getAvailableTimes(+doctorId, date);
  }

  @Get('available-times/package')
  async getAvailableTimesForPackage(
    @Query('packageId') packageId: string,
    @Query('date') date: string,
  ) {
    if (!packageId || !date) {
      throw new BadRequestException('Thiếu packageId hoặc date');
    }
    return this.appointmentsService.getAvailableTimesForPackage(+packageId, date);
  }

  @Get('available-doctors/package')
  async getAvailableDoctorsForPackage(
    @Query('packageId') packageId: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    if (!packageId || !date || !time) {
      throw new BadRequestException('Thiếu packageId, date hoặc time');
    }
    return this.appointmentsService.getAvailableDoctorsForPackage(+packageId, date, time);
  }

  @Post('/')
  @ApiOperation({ summary: 'Tạo lịch hẹn mới' }) // Mô tả chức năng
  @ApiResponse({
    status: 201,
    description: 'Tạo lịch hẹn thành công.',
    type: Appointment, // Cho Swagger biết dữ liệu trả về là Entity Appointment
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  @ApiOperation({ summary: 'Lấy danh sách tất cả lịch hẹn' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch hẹn.',
    type: [Appointment], // Trả về mảng []
  })
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('hospital_id') hospitalId?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.appointmentsService.findAll(req.user, pageNumber, limitNumber, status, hospitalId, search);
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn theo bệnh nhân' })
  findByUser(@Param('userId') userId: string) {
    return this.appointmentsService.findByUser(+userId);
  }

  @Get('/schedule/:scheduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn thuộc 1 ca trực' })
  findBySchedule(@Param('scheduleId') scheduleId: string, @Req() req: any) {
    return this.appointmentsService.findBySchedule(+scheduleId, req.user);
  }

  @Get('/doctor/:doctorId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn theo bác sĩ' })
  findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findByDoctor(+doctorId, date);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto, req.user);
  }

  @Patch('/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital', 'doctor', 'patient')
  @ApiOperation({ summary: 'Cập nhật trạng thái lịch hẹn (bác sĩ / hệ thống)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.updateStatus(
      +id,
      updateStatusDto,
      req.user,
    );
  }

  @Post('/:id/request-refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @ApiOperation({ summary: 'Yêu cầu hoàn tiền cho lịch hẹn bị hủy' })
  requestRefund(
    @Param('id') id: string, 
    @Req() req: any,
    @Body() bankInfo?: { bankName?: string; bankAccount?: string; accountName?: string }
  ) {
    return this.appointmentsService.requestRefund(+id, req.user, bankInfo);
  }

  @Put('/:id/reschedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @ApiOperation({ summary: 'Dời lịch khám cho lịch hẹn bị hủy' })
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.reschedule(+id, rescheduleDto, req.user);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  @ApiOperation({ summary: 'Xóa lịch hẹn' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch hẹn.' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.remove(+id, req.user);
  }
}
