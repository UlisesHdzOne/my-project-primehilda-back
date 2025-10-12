import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/common/constants/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
