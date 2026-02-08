import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { Category } from 'src/categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100, nullable: true })
  main_specialty: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.hospital)
  appointments: Appointment[];

  @ManyToMany(() => Doctor, (doctor) => doctor.hospitals)
  doctors: Doctor[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'hospital_category',
    joinColumn: { name: 'hospital_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];
}
