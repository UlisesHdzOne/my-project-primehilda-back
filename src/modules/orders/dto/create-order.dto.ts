import {
  IsInt,
  IsPositive,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  ValidateIf,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';
import { OrderType } from 'src/common/constants/order-type.enum';
import { DeliveryMethod } from 'src/common/constants/delivery-method.enum';
import { ORDER_MESSAGES } from 'src/common/constants/order-messages';

export class CreateOrderDto {
  @IsInt({ message: ORDER_MESSAGES.clienteInvalido })
  @IsPositive({ message: ORDER_MESSAGES.clienteInvalido })
  customerId: number; // ID del cliente (usuario CONSUMER)

  @IsEnum(OrderType, { message: ORDER_MESSAGES.tipoOrdenInvalido })
  orderType: OrderType;

  @IsDateString({}, { message: ORDER_MESSAGES.fechaEntregaInvalida })
  deliveryDate: string;

  @IsString({ message: ORDER_MESSAGES.horaEntregaInvalida })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: ORDER_MESSAGES.horaEntregaInvalida,
  })
  deliveryTime: string;

  @IsEnum(DeliveryMethod, { message: ORDER_MESSAGES.metodoEntregaInvalido })
  deliveryMethod: DeliveryMethod;

  @ValidateIf(
    (o: CreateOrderDto) => o.deliveryMethod === DeliveryMethod.DELIVERY,
  )
  @IsInt({ message: ORDER_MESSAGES.direccionEntregaInvalida })
  @IsPositive({ message: ORDER_MESSAGES.direccionEntregaInvalida })
  deliveryAddressId?: number; // Requerido solo si deliveryMethod === DELIVERY

  @IsArray({ message: ORDER_MESSAGES.itemsOrdenInvalidos })
  @ArrayMinSize(1, { message: ORDER_MESSAGES.itemsOrdenRequeridos })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsOptional()
  @IsString({ message: ORDER_MESSAGES.notasInvalidas })
  notes?: string;
}
