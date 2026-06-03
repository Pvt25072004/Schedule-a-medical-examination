import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { PayOS } from '@payos/node';

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
      amount: Number(appointment.total_fee),
      base_fee: Number(appointment.total_fee),
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

    const appointment = await this.appointmentsRepository.findOne({ where: { id: appointmentId } });
    if (!appointment) throw new Error('Appointment not found');
    const realAmount = Number(appointment.total_fee);

    const vnpay = this.getVnpayInstance();
    const date = new Date();
    const orderId = dayjs(date).format('DDHHmmss');

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: realAmount, // vnpay library automatically multiplies by 100
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: `${appointmentId}_${orderId}`,
      vnp_OrderInfo: orderInfo,
    });

    // Cập nhật phương thức thanh toán nếu người dùng đổi ý khi retry
    const payment = await this.paymentsRepository.findOne({ where: { appointment_id: appointmentId } });
    if (payment) {
      payment.payment_method = 'vnpay';
      await this.paymentsRepository.save(payment);
    }

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
            payment.payment_method = 'vnpay'; // Cập nhật lại chuẩn xác phương thức thanh toán cuối cùng
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

  getPayosInstance() {
    const clientId = process.env.PAYOS_CLIENT_ID || '';
    const apiKey = process.env.PAYOS_API_KEY || '';
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY || '';
    if (!clientId || !apiKey || !checksumKey) {
      throw new Error('PayOS config is missing in .env');
    }
    return new PayOS({ clientId, apiKey, checksumKey });
  }

  async createPayosUrl(req: any, appointmentId: number, amount: number, orderInfo: string): Promise<string> {
    const payos = this.getPayosInstance();
    const returnUrl = process.env.PAYOS_RETURN_URL || 'http://localhost:5173/appointments';
    const cancelUrl = process.env.PAYOS_CANCEL_URL || 'http://localhost:5173/appointments';

    const orderCode = Number(`${appointmentId}${Math.floor(1000 + Math.random() * 9000)}`);
    
    const appointment = await this.appointmentsRepository.findOne({ where: { id: appointmentId } });
    if (!appointment) throw new Error('Appointment not found');
    const realAmount = Number(appointment.total_fee);

    const payment = await this.paymentsRepository.findOne({ where: { appointment_id: appointmentId } });
    if (payment) {
      payment.transaction_id = String(orderCode);
      payment.payment_method = 'payos';
      await this.paymentsRepository.save(payment);
    }

    const requestData = {
      orderCode,
      amount: realAmount,
      description: (orderInfo || `Thanh toan lich ${appointmentId}`).substring(0, 25),
      returnUrl,
      cancelUrl,
    };

    try {
      const paymentLinkData = await payos.paymentRequests.create(requestData);
      return paymentLinkData.checkoutUrl;
    } catch (error) {
      console.error('PayOS createPaymentLink error:', error);
      throw new Error('Lỗi tạo link thanh toán PayOS');
    }
  }

  async verifyPayosWebhook(webhookData: any): Promise<any> {
    const payos = this.getPayosInstance();

    try {
      const data = await payos.webhooks.verify(webhookData);
      
      if (data) {
        const orderCode = String(data.orderCode);
        
        const payment = await this.paymentsRepository.findOne({
          where: { transaction_id: orderCode },
        });

        if (payment) {
          if (payment.payment_status === 'completed') {
            return { message: 'Order already confirmed' };
          }

          payment.payment_status = 'completed';
          payment.paid_at = new Date();
          payment.payment_method = 'payos'; // Cập nhật lại chuẩn xác phương thức thanh toán cuối cùng
          await this.paymentsRepository.save(payment);
          
          const appointment = await this.appointmentsRepository.findOne({ where: { id: payment.appointment_id } });
          if (appointment) {
            appointment.status = 'confirmed';
            await this.appointmentsRepository.save(appointment);
          }
          
          return { success: true, message: 'Payment confirmed via PayOS' };
        } else {
          return { success: false, message: 'Order not found' };
        }
      }
    } catch (e) {
      console.error('PayOS Webhook Error:', e);
      return { success: false, message: 'Invalid signature or data' };
    }
  }

  async getDashboardStats(user?: any): Promise<any> {
    const qbRevenue = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoin('payment.appointment', 'appointment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.payment_status = :status', { status: 'completed' });
    if (user?.role === 'admin_hospital') {
      qbRevenue.andWhere('appointment.hospital_id = :hospitalId', { hospitalId: user.hospital_id });
    }
    const totalRevenueResult = await qbRevenue.getRawOne();
    
    // Doanh thu tháng này
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const qbMonthly = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoin('payment.appointment', 'appointment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.payment_status = :status', { status: 'completed' })
      .andWhere('payment.created_at >= :startOfMonth', { startOfMonth });
    if (user?.role === 'admin_hospital') {
      qbMonthly.andWhere('appointment.hospital_id = :hospitalId', { hospitalId: user.hospital_id });
    }
    const monthlyRevenueResult = await qbMonthly.getRawOne();

    // Lấy doanh thu theo từng tháng (6 tháng gần nhất) cho biểu đồ
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const qbChart = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoin('payment.appointment', 'appointment')
      .select('MONTH(payment.created_at) AS month, YEAR(payment.created_at) AS year, SUM(payment.amount) AS total')
      .where('payment.payment_status = :status', { status: 'completed' })
      .andWhere('payment.created_at >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy('YEAR(payment.created_at), MONTH(payment.created_at)')
      .orderBy('YEAR(payment.created_at)', 'ASC')
      .addOrderBy('MONTH(payment.created_at)', 'ASC');
    if (user?.role === 'admin_hospital') {
      qbChart.andWhere('appointment.hospital_id = :hospitalId', { hospitalId: user.hospital_id });
    }
    const revenueByMonthRaw = await qbChart.getRawMany();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueChart = revenueByMonthRaw.map(row => ({
      name: `${monthNames[row.month - 1]}`,
      total: Number(row.total) || 0
    }));

    // Số cuộc hẹn mới
    let totalAppointments = 0;
    if (user?.role === 'admin_hospital') {
      totalAppointments = await this.appointmentsRepository.count({ where: { hospital_id: user.hospital_id } });
    } else {
      totalAppointments = await this.appointmentsRepository.count();
    }
    
    return {
      totalRevenue: Number(totalRevenueResult.total) || 0,
      monthlyRevenue: Number(monthlyRevenueResult.total) || 0,
      revenueChart,
      totalAppointments
    };
  }

  async findAll(query: any = {}, user?: any): Promise<any> {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.appointment', 'appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .orderBy('payment.created_at', 'DESC');

    if (user?.role === 'admin_hospital') {
      qb.andWhere('appointment.hospital_id = :hospitalId', { hospitalId: user.hospital_id });
    }

    if (query.startDate) {
      qb.andWhere('payment.created_at >= :startDate', { startDate: new Date(query.startDate) });
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      qb.andWhere('payment.created_at <= :endDate', { endDate });
    }
    if (query.search) {
      qb.andWhere('(user.full_name LIKE :search OR payment.transaction_id LIKE :search OR CAST(appointment.id AS CHAR) LIKE :search)', { search: `%${query.search}%` });
    }

    if (query.page) {
      qb.skip(skip).take(limit);
      const [data, total] = await qb.getManyAndCount();
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      // Return all if no pagination params (for backwards compatibility if needed)
      return qb.getMany();
    }
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
