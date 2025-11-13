import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) {}

  findAll(): Promise<Doctor[]> {
    return this.doctorsRepository.find();
  }

  findOne(id: number): Promise<Doctor | null> {
    return this.doctorsRepository.findOneBy({ id });
  }
  // create, update, remove...
}
