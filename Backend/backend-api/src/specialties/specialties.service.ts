import { Injectable, NotFoundException } from "@nestjs/common";
import { In } from "typeorm";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Specialty } from "./entities/specialty.entity";
import { CreateSpecialtyDto } from "./dto/create-specialty.dto";
import { UpdateSpecialtyDto } from "./dto/update-specialty.dto";

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private specialtiesRepository: Repository<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const specialty = this.specialtiesRepository.create(createSpecialtyDto);
    return await this.specialtiesRepository.save(specialty);
  }
  
  async findAll(): Promise<Specialty[]> {
    return this.specialtiesRepository.find({
      order: { name: "ASC" },
    });
  }

  async findOne(id: number): Promise<Specialty> {
    const specialty = await this.specialtiesRepository.findOneBy({ id });
    if (!specialty) throw new NotFoundException("Specialty not found");
    return specialty;
  }

  async findByIds(ids: number[]): Promise<Specialty[]> {
    return this.specialtiesRepository.find({
      where: { id: In(ids) },
    });
  }

  async findByHospitalId(hospitalId: number): Promise<Specialty[]> {
    return await this.specialtiesRepository
      .createQueryBuilder("specialty")
      .innerJoin("specialty.hospitals", "hospital", "hospital.id = :hospitalId", { hospitalId: hospitalId })
      .select(["specialty.id", "specialty.name"])
      .orderBy("specialty.name", "ASC")
      .getMany();
  }

  async update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    const specialty = await this.findOne(id);
    Object.assign(specialty, updateSpecialtyDto);
    return this.specialtiesRepository.save(specialty);
  }

  async remove(id: number) {
    const specialty = await this.findOne(id);
    return this.specialtiesRepository.remove(specialty);
  }

}