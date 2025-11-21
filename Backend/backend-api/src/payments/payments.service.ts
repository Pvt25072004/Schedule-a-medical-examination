import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { AppointmentsService } from '../appointments/appointments.service';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @Inject(forwardRef(() => AppointmentsService))
    private appointmentsService: AppointmentsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Check if appointment exists (will throw if not found)
    const appointmentId = createPaymentDto.appointment_id as number;
    const findOnePromise: Promise<Appointment> =
      this.appointmentsService.findOne(appointmentId);
    await findOnePromise;

    // Check if payment already exists for this appointment
    const appointmentIdForPayment = createPaymentDto.appointment_id as number;
    const existingPayment: Payment | null =
      await this.paymentsRepository.findOne({
        where: { appointment_id: appointmentIdForPayment },
      });

    if (existingPayment) {
      throw new BadRequestException('Thanh toán cho lịch hẹn này đã tồn tại');
    }

    // Calculate total amount
    const baseFee: number = createPaymentDto.base_fee as number;
    const onlineFee: number =
      (createPaymentDto.online_fee as number | undefined) ?? 0;
    const vat: number = (createPaymentDto.vat as number | undefined) ?? 0;
    const amount: number = baseFee + onlineFee + (baseFee * vat) / 100;

    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      amount,
      payment_status: 'pending',
    });

    return await this.paymentsRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      relations: ['appointment'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['appointment'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment với ID ${id} không tồn tại`);
    }

    return payment;
  }

  async findByAppointment(appointmentId: number): Promise<Payment | null> {
    return await this.paymentsRepository.findOne({
      where: { appointment_id: appointmentId },
      relations: ['appointment'],
    });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    // Recalculate amount if fees changed
    if (
      updatePaymentDto.base_fee ||
      updatePaymentDto.online_fee !== undefined ||
      updatePaymentDto.vat !== undefined
    ) {
      const baseFee: number =
        (updatePaymentDto.base_fee as number | undefined) ?? payment.base_fee;
      const onlineFee: number =
        (updatePaymentDto.online_fee as number | undefined) ??
        payment.online_fee;
      const vat: number =
        (updatePaymentDto.vat as number | undefined) ?? payment.vat;
      payment.amount = baseFee + onlineFee + (baseFee * vat) / 100;
    }

    Object.assign(payment, updatePaymentDto);

    // If payment status changed to completed, update appointment status
    if (
      'payment_status' in updatePaymentDto &&
      updatePaymentDto.payment_status === 'completed' &&
      payment.payment_status !== 'completed'
    ) {
      payment.paid_at = new Date();
      await this.appointmentsService.updateStatus(
        payment.appointment_id,
        'confirmed',
      );
    }

    return await this.paymentsRepository.save(payment);
  }

  async updateStatus(
    id: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.payment_status = status;

    if (status === 'completed') {
      payment.paid_at = new Date();
      await this.appointmentsService.updateStatus(
        payment.appointment_id,
        'confirmed',
      );
    }

    return await this.paymentsRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);

    if (payment.payment_status === 'completed') {
      throw new BadRequestException('Không thể xóa thanh toán đã hoàn thành');
    }

    await this.paymentsRepository.remove(payment);
  }
}
