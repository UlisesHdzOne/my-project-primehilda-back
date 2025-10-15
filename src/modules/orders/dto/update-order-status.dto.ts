import { IsEnum, IsString, Matches, ValidateIf } from 'class-validator';
import { OrderStatus } from 'src/common/constants/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  // ConfirmedDeliveryTime: Obligatorio si el estado cambia a CONFIRMED
  @ValidateIf((o: UpdateOrderStatusDto) => o.status === OrderStatus.CONFIRMED)
  @IsString({
    message:
      'La hora prometida de recogida/entrega (HH:MM) es requerida al CONFIRMAR el pedido.',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Formato de hora prometida inválido (HH:MM).',
  })
  confirmedDeliveryTime?: string;
}
