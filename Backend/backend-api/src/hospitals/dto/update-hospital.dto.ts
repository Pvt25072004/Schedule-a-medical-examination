import { PartialType } from '@nestjs/mapped-types';
import { CreateHospitalDto } from './create-hospital.dto';
import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { RelationIdDto } from '../../common/dto/relation-id.dto'; // Import DTO ID

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {
    // Thêm trường specialties (mối quan hệ Many-to-Many)
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RelationIdDto) // Sử dụng DTO ID đã tạo
    specialties?: RelationIdDto[];
}