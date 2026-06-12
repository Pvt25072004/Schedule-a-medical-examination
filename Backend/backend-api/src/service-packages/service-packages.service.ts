import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePackage } from './entities/service-package.entity';

@Injectable()
export class ServicePackagesService {
  constructor(
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepo: Repository<ServicePackage>,
  ) {}

  async findAll(hospital_id?: number): Promise<ServicePackage[]> {
    const options: any = {
      relations: ['categories', 'hospitals'],
      order: { created_at: 'DESC' },
    };

    if (hospital_id) {
      options.where = {
        hospitals: {
          id: hospital_id,
        },
      };
    }

    return this.servicePackageRepo.find(options);
  }

  async findOne(id: number): Promise<ServicePackage> {
    const servicePackage = await this.servicePackageRepo.findOne({
      where: { id },
      relations: ['categories', 'hospitals', 'doctors'],
    });
    if (!servicePackage) {
      throw new NotFoundException(`ServicePackage #${id} not found`);
    }
    return servicePackage;
  }

  async create(data: Partial<ServicePackage>): Promise<ServicePackage> {
    const pkg = this.servicePackageRepo.create(data);
    return this.servicePackageRepo.save(pkg);
  }

  async findPopular(limit: number = 6): Promise<ServicePackage[]> {
    return this.servicePackageRepo.find({
      where: { is_active: true },
      order: { booking_count: 'DESC', created_at: 'DESC' },
      take: limit,
      relations: ['categories', 'hospitals'], // perhaps just basic info for the card
    });
  }

  async update(id: number, data: Partial<ServicePackage>): Promise<ServicePackage> {
    const pkg = await this.findOne(id);
    const updated = this.servicePackageRepo.merge(pkg, data);
    return this.servicePackageRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const pkg = await this.findOne(id);
    await this.servicePackageRepo.remove(pkg);
  }
}
