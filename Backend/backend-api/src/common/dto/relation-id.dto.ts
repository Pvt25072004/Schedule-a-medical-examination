// src/common/dto/relation-id.dto.ts (Ví dụ)
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RelationIdDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    id: number;
}