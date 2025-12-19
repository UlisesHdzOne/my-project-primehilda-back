import { PaymentMethod } from '@/common/enums';
import { IsEnum, IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  washOrderId!: number;

  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
