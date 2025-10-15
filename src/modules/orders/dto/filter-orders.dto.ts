// src/modules/orders/dto/filter-orders.dto.ts
import { IsOptional, IsEnum, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/constants/order-status.enum';

export class FilterOrdersDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number) // Esto es crucial para convertir el string de query a number
  @IsInt()
  @IsPositive()
  customerId?: number;
}
