import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialty: string; // Chuyên khoa

  @Column({ default: true })
  isActive: boolean;
}
