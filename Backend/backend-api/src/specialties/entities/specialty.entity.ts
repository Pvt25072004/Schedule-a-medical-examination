import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany} from 'typeorm';
import { Hospital } from '../../hospitals/entities/hospital.entity'; // Quan hệ 1-n
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn()
  id: number; // ID chuyên khoa

  @Column({ length: 100 })
  name: string; // Tên chuyên khoa

  @Column()
  description: string; // Mô tả chuyên khoa

  // Mối quan hệ: Một Chuyên khoa có nhiều Bệnh viện
  @ManyToMany(() => Hospital, (hospital) => hospital.specialties)
  @JoinTable({
    name: 'specialty_hospital',
    joinColumn: {
      name: 'specialty_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'hospital_id',
      referencedColumnName: 'id',
    },
  })
  hospitals: Hospital[];

  @ManyToMany(() => Doctor, (doctor) => doctor.specialties)
  doctors: Doctor[];
}