import { IsEnum } from 'class-validator';
import { OrderStatus } from '@/common/enums';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Estado inválido. Opciones válidas: pending, in_progress, done, delivered, cancelled',
  })
  status!: OrderStatus;
}
