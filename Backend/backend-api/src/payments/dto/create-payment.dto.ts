import { IsInt, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  appointment_id: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  base_fee: number;

  @IsNumber()
  @IsOptional()
  online_fee?: number;

  @IsNumber()
  @IsOptional()
  vat?: number;

  @IsEnum(['vnpay', 'momo', 'cash', 'atm', 'credit_card'])
  @IsNotEmpty()
  payment_method: string;
}
