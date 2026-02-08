import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

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
      payment_status: 'completed',
      paid_at: new Date(),
    } as Partial<Payment>);

    const saved = await this.paymentsRepository.save(payment);

    // Với demo hiện tại, sau khi thanh toán xong vẫn giữ trạng thái lịch hẹn là 'pending'
    // để bác sĩ chủ động xác nhận hoặc từ chối lịch hẹn.
    return saved;
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
}
