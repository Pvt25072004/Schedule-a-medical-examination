import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Repository, MoreThanOrEqual, In, DataSource } from 'typeorm';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
    private pricingService: PricingService,
    private dataSource: DataSource,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // Bắt đầu Transaction với cấp độ cách ly SERIALIZABLE để chống Race Condition tuyệt đối
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      let schedule: Schedule | null = null;
      const appointmentDateStr = createAppointmentDto.appointment_date.slice(0, 10);
      const appointmentTime = createAppointmentDto.appointment_time;

      if (createAppointmentDto.schedule_id) {
        schedule = await queryRunner.manager.findOne(Schedule, {
          where: { id: createAppointmentDto.schedule_id },
        });
      } else {
        schedule = await queryRunner.manager
          .createQueryBuilder(Schedule, 'schedule')
          .where('schedule.doctor_id = :doctorId', {
            doctorId: createAppointmentDto.doctor_id,
          })
          .andWhere('schedule.hospital_id = :hospitalId', {
            hospitalId: createAppointmentDto.hospital_id,
          })
          .andWhere('schedule.work_date = :workDate', {
            workDate: appointmentDateStr,
          })
          .andWhere('schedule.start_time <= :appointmentTime', {
            appointmentTime,
          })
          .andWhere('schedule.end_time >= :appointmentTime', {
            appointmentTime,
          })
          .getOne();
      }

      if (!schedule) {
        throw new BadRequestException('Không tìm thấy lịch làm việc phù hợp của bác sĩ vào thời gian đã chọn!');
      }

      if (!schedule.is_available) {
        throw new BadRequestException('Ca làm việc này của bác sĩ hiện đã tạm ngưng hoặc không khả dụng. Vui lòng chọn ca khác!');
      }

      // KIỂM TRA MỚI: Check trùng giờ cụ thể
      const exactTimeConflict = await queryRunner.manager.count(Appointment, {
        where: {
          doctor_id: createAppointmentDto.doctor_id,
          appointment_date: appointmentDateStr as any,
          appointment_time: appointmentTime,
          status: In(['pending', 'confirmed']),
        },
      });

      if (exactTimeConflict > 0) {
        throw new BadRequestException(`Giờ ${appointmentTime} này đã có người đặt thành công. Vui lòng chọn khung giờ khác!`);
      }

      // Kiểm tra sức chứa của cả ca
      const existingAppointmentsCount = await queryRunner.manager.count(Appointment, {
        where: {
          schedule_id: schedule.id,
          status: In(['pending', 'confirmed']),
        },
      });

      if (existingAppointmentsCount >= schedule.max_patients) {
        throw new BadRequestException(`Ca làm việc này đã đầy bệnh nhân (tối đa ${schedule.max_patients} người/ca). Vui lòng chọn ca khám khác!`);
      }

      createAppointmentDto.schedule_id = schedule.id;

      const [doctor, hospital] = await Promise.all([
        queryRunner.manager.findOneBy(Doctor, { id: createAppointmentDto.doctor_id }),
        queryRunner.manager.findOneBy(Hospital, { id: createAppointmentDto.hospital_id }),
      ]);

      if (!doctor || !hospital) {
        throw new BadRequestException('Thông tin bác sĩ hoặc bệnh viện không hợp lệ!');
      }

      const pricing = this.pricingService.calculateAppointmentFee(doctor, hospital);

      const appointment = queryRunner.manager.create(Appointment, {
        ...createAppointmentDto,
        doctor_fee_snapshot: pricing.doctorFeeSnapshot,
        hospital_fee_snapshot: pricing.hospitalFeeSnapshot,
        total_fee: pricing.totalFee,
        doctor_name_snapshot: pricing.doctorNameSnapshot,
        hospital_name_snapshot: pricing.hospitalNameSnapshot,
        currency_snapshot: pricing.currencySnapshot,
      });

      const savedAppointment = await queryRunner.manager.save(Appointment, appointment);
      
      await queryRunner.commitTransaction();
      return savedAppointment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra trong quá trình xử lý đặt lịch.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find();
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = (await this.findOne(id)) as Appointment;
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: number) {
    const appointment = (await this.findOne(id)) as Appointment;
    return this.appointmentsRepository.remove(appointment);
  }

  async findByDoctor(doctorId: number, date?: string): Promise<Appointment[]> {
    const where: any = { doctor_id: doctorId };
    if (date) {
      where.appointment_date = date;
    } else {
      // mặc định lấy từ hôm nay trở đi
      where.appointment_date = MoreThanOrEqual(
        new Date().toISOString().slice(0, 10),
      );
    }

    return this.appointmentsRepository.find({
      where,
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['user', 'hospital'],
    });
  }

  async findByUser(userId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { user_id: userId },
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
      relations: ['doctor', 'hospital', 'review'],
    });
  }

  async updateStatus(
    id: number,
    status: string,
    reason?: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new Error(`Appointment #${id} not found`);
    }
    appointment.status = status;
    if (status === 'rejected') {
      appointment.cancel_reason = reason || null;
    } else if (status === 'confirmed' || status === 'completed') {
      // Khi xác nhận / hoàn thành thì xóa lý do hủy trước đó (nếu có)
      appointment.cancel_reason = null;
    }
    return this.appointmentsRepository.save(appointment);
  }

  async getAvailableTimes(doctorId: number, date: string): Promise<string[]> {
    // 1. Fetch all schedules for this doctor on this date
    const schedules = await this.schedulesRepository.find({
      where: { doctor_id: doctorId, work_date: date as any, is_available: true },
    });

    if (schedules.length === 0) {
      return [];
    }

    // 2. Fetch all appointments for this doctor on this date
    const appointments = await this.appointmentsRepository.find({
      where: {
        doctor_id: doctorId,
        appointment_date: date as any, // TypeORM expected Date object but string "YYYY-MM-DD" works for DB
        status: In(['pending', 'confirmed']),
      },
    });

    // 3. Collect booked times
    const bookedTimes = new Set(
      appointments.map((a) => a.appointment_time.slice(0, 5)), // "HH:mm"
    );

    // 4. Generate all 30-min slots based on schedules
    const availableSlots = new Set<string>();
    const now = new Date();
    const isToday = date === now.toISOString().slice(0, 10);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMins = currentHour * 60 + currentMinute;

    for (const schedule of schedules) {
      const start = schedule.start_time.slice(0, 5); // "HH:mm"
      const end = schedule.end_time.slice(0, 5);

      if (!start || !end) continue;

      let [h, m] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const endTotalMins = endH * 60 + endM;

      while (h * 60 + m < endTotalMins) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        // Check if past current time (if today)
        let isPast = false;
        if (isToday) {
          const slotTotalMins = h * 60 + m;
          // Thêm 30p buffer cho an toàn
          if (slotTotalMins <= currentTotalMins + 30) {
            isPast = true;
          }
        }

        if (!isPast && !bookedTimes.has(timeStr)) {
          availableSlots.add(timeStr);
        }

        m += 30;
        if (m >= 60) {
          h += 1;
          m -= 60;
        }
      }
    }

    return Array.from(availableSlots).sort();
  }
}
