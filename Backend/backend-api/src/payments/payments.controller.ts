import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('vnpay/create-url')
  @UseGuards(JwtAuthGuard)
  async createVnpayUrl(@Req() req: any, @Body() body: { appointment_id: number; amount: number; orderInfo: string }) {
    // Để tích hợp dễ dàng, tạo record Payment trước
    const createDto: CreatePaymentDto = {
      appointment_id: body.appointment_id,
      amount: body.amount,
      base_fee: body.amount,
      online_fee: 0,
      vat: 0,
      payment_method: 'vnpay'
    };
    
    // Nếu payment đã tồn tại thì không tạo lại, mà cứ tạo URL.
    // Ở đây ta đơn giản hoá bằng cách gọi luôn create (có thể catch error nếu unique constraint,
    // tuỳ thiết kế entity Appointment-Payment là OneToOne).
    try {
      await this.paymentsService.create(createDto);
    } catch (e) {
      // Đã có payment record, bỏ qua lỗi
    }

    const url = await this.paymentsService.createVnpayUrl(req, body.appointment_id, body.amount, body.orderInfo || 'Thanh toan VNPAY');
    return { url };
  }

  @Get('vnpay/ipn')
  async vnpayIpn(@Query() query: any) {
    return this.paymentsService.verifyVnpayIpn(query);
  }
  
  @Get('vnpay/vnpay-return')
  async vnpayReturn(@Query() query: any) {
    // Endpoint này được gọi bởi Frontend để xử lý Return URL (Fallback khi IPN không gọi được ở localhost)
    const result = await this.paymentsService.verifyVnpayIpn(query);
    return { message: 'Return from VNPAY processed', data: query, result };
  }

  @Post('payos/create-url')
  @UseGuards(JwtAuthGuard)
  async createPayosUrl(@Req() req: any, @Body() body: { appointment_id: number; amount: number; orderInfo: string }) {
    const createDto: CreatePaymentDto = {
      appointment_id: body.appointment_id,
      amount: body.amount,
      base_fee: body.amount,
      online_fee: 0,
      vat: 0,
      payment_method: 'payos'
    };
    
    try {
      await this.paymentsService.create(createDto);
    } catch (e) {
      // Đã có payment record, bỏ qua lỗi
    }

    const url = await this.paymentsService.createPayosUrl(req, body.appointment_id, body.amount, body.orderInfo || 'Thanh toan PayOS');
    return { url };
  }

  @Post('payos/webhook')
  async payosWebhook(@Body() body: any) {
    return this.paymentsService.verifyPayosWebhook(body);
  }

  @Get('appointment/:appointmentId')
  async getByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.paymentsService.findByAppointment(+appointmentId);
  }

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  getDashboardStats(@Req() req: any) {
    return this.paymentsService.getDashboardStats(req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  findAll(@Query() query: any, @Req() req: any) {
    return this.paymentsService.findAll(query, req.user);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.paymentsService.findByDoctor(+doctorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
