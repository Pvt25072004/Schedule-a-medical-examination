import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Doctor } from 'src/doctors/doctor.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ServicePackage } from 'src/service-packages/entities/service-package.entity';
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
import { Banner } from 'src/banner/entities/banner.entity';
import { Fanpage } from 'src/fanpages/entities/fanpage.entity';
import { OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { City } from 'src/cities/entities/city.entity';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100, nullable: true })
  main_specialty: string;

  @Column({ length: 50, nullable: true })
  hospital_type: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 100000,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  facility_fee: number;

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
  categories?: Category[];

  @OneToMany(() => Banner, (banner) => banner.hospital)
  banners?: Banner[];

  @OneToOne(() => Fanpage, (fanpage) => fanpage.hospital)
  fanpage?: Fanpage;

  @ManyToMany(() => ServicePackage, (servicePackage) => servicePackage.hospitals)
  service_packages?: ServicePackage[];

}
