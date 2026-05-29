import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsEnum(['approved', 'rejected'])
  @IsNotEmpty()
  status: 'approved' | 'rejected';

  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
