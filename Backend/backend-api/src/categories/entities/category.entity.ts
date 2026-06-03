import { Banner } from 'src/banner/entities/banner.entity';
import { ServicePackage } from 'src/service-packages/entities/service-package.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 120, unique: true })
  slug: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Banner, (banner) => banner.category)
  banners?: Banner[] | null;

  @ManyToMany(() => ServicePackage, (servicePackage) => servicePackage.categories)
  service_packages?: ServicePackage[];
}
