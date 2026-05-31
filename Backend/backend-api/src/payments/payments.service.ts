import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import * as crypto from 'crypto';
import dayjs from 'dayjs';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: createPaymentDto.appointment_id },
    });
    if (!appointment) {
      throw new NotFoundException(
        `Appointment #${createPaymentDto.appointment_id} not found`,
      );
    }

    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      payment_status: 'pending', // VNPay chưa thanh toán thì để pending
    } as Partial<Payment>);

    const saved = await this.paymentsRepository.save(payment);

    return saved;
  }

  getVnpayInstance() {
    const { VNPay } = require('vnpay');
    return new VNPay({
      tmnCode: process.env.VNP_TMNCODE || '',
      secureSecret: process.env.VNP_HASHSECRET || '',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512',
    });
  }

  async createVnpayUrl(req: any, appointmentId: number, amount: number, orderInfo: string): Promise<string> {
    let ipAddr = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    if (Array.isArray(ipAddr)) ipAddr = ipAddr[0];
    else if (typeof ipAddr === 'string' && ipAddr.includes(',')) ipAddr = ipAddr.split(',')[0].trim();

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const returnUrl = process.env.VNP_RETURN_URL;

    if (!tmnCode || !secretKey || !returnUrl) {
      throw new Error('VNPAY config is missing in .env');
    }

    const vnpay = this.getVnpayInstance();
    const date = new Date();
    const orderId = dayjs(date).format('DDHHmmss');

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount, // vnpay library automatically multiplies by 100
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: `${appointmentId}_${orderId}`,
      vnp_OrderInfo: orderInfo,
    });

    return paymentUrl;
  }

  async verifyVnpayIpn(vnp_Params: any): Promise<any> {
    const vnpay = this.getVnpayInstance();

    try {
      console.log('verifyVnpayIpn called with:', vnp_Params);
      const verify = vnpay.verifyIpnCall(vnp_Params);
      console.log('Verify result:', verify);
      
      if (verify.isVerified) {
        const orderInfo = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const appointmentId = parseInt(orderInfo.split('_')[0], 10);
        
        const payment = await this.paymentsRepository.findOne({
          where: { appointment_id: appointmentId },
        });

        if (payment) {
          // BẢO VỆ LOGIC: Nếu payment đã hoàn thành trước đó (qua link khác), KHÔNG cho phép IPN cũ ghi đè thành failed.
          if (payment.payment_status === 'completed') {
            return { RspCode: '02', Message: 'Order already confirmed' };
          }

          if (responseCode === '00') {
            payment.payment_status = 'completed';
            payment.paid_at = new Date();
            payment.transaction_id = vnp_Params['vnp_TransactionNo'];
            await this.paymentsRepository.save(payment);
            
            // Cập nhật lịch khám thành confirmed
            const appointment = await this.appointmentsRepository.findOne({ where: { id: payment.appointment_id } });
            if (appointment) {
              appointment.status = 'confirmed';
              await this.appointmentsRepository.save(appointment);
            }
            
            return { RspCode: '00', Message: 'Confirm Success' };
          } else {
            // Không tự động hủy (cancelled) lịch hẹn ở đây nữa! 
            // Giữ nguyên để UI hiện "Chờ thanh toán". Việc hủy sẽ do Cronjob dọn dẹp sau 15 phút.
            return { RspCode: '00', Message: 'Payment Failed but IPN Received (Ignored for Retry)' };
          }
        } else {
          return { RspCode: '01', Message: 'Order not found' };
        }
      } else {
        return { RspCode: '97', Message: 'Invalid signature' };
      }
    } catch (e) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }
  }

  findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find();
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
    return payment;
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
  }

  async findByDoctor(doctorId: number): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['appointment', 'appointment.user', 'appointment.doctor'],
      where: {
        appointment: { doctor_id: doctorId },
      } as any,
      order: { created_at: 'DESC' },
    });
  }

  async findByAppointment(appointmentId: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { appointment_id: appointmentId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment for Appointment #${appointmentId} not found`);
    }
    return payment;
  }
}
