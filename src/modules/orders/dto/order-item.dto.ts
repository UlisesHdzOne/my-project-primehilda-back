import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { ORDER_MESSAGES } from 'src/common/constants/order-messages';

// DTO para la elección específica de un producto de regalo
export class ChosenGiftDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number; // El ID del producto específico que el cliente elige (ej. Coca-Cola ID 50)

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number; // La cantidad que el cliente desea de ese regalo
}
export class OrderItemDto {
  @IsNotEmpty({ message: ORDER_MESSAGES.productoInvalido })
  @IsInt({ message: ORDER_MESSAGES.productoInvalido })
  @IsPositive({ message: ORDER_MESSAGES.productoInvalido })
  productId: number;

  @IsNotEmpty({ message: ORDER_MESSAGES.cantidadProductoInvalida })
  @IsInt({ message: ORDER_MESSAGES.cantidadProductoInvalida })
  @Min(1, { message: ORDER_MESSAGES.cantidadProductoInvalida })
  quantity: number;

  // Campo opcional para la lista de regalos específicos elegidos por el cliente
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChosenGiftDto)
  chosenGifts?: ChosenGiftDto[];
}
