import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Hospital } from '../../hospitals/entities/hospital.entity'; // Quan hệ 1-n

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number; // ID của tỉnh/thành

  @Column()
  name: string; // Tên tỉnh/thành (Ví dụ: 'Hà Nội', 'TP. Hồ Chí Minh')

  // Mối quan hệ: Một Tỉnh/thành có nhiều Bệnh viện
  @OneToMany(() => Hospital, (hospital) => hospital.area)
  hospitals: Hospital[];
}