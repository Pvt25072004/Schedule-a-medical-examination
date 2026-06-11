import { Doctor } from 'src/doctors/doctor.entity';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';
@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  doctor_id: number;

  @Column()
  hospital_id: number;

  @Column({ type: 'date' })
  work_date: Date;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ nullable: true })
  room_id: number;

  @ManyToOne(() => Room, (room) => room.schedules, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ default: 10 })
  max_patients: number;

  @Column({ default: false })
  is_available: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  approval_status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor | null;

  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital | null;
}
