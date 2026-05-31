import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('vnpay/create-url')
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

  @Get('appointment/:appointmentId')
  async getByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.paymentsService.findByAppointment(+appointmentId);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
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
