import {
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  appointment_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  base_fee: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  online_fee?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  vat?: number;

  @IsEnum(['vnpay', 'momo', 'cash', 'atm', 'credit_card'])
  @IsNotEmpty()
  payment_method: string;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  @IsOptional()
  payment_status?: string;
}
