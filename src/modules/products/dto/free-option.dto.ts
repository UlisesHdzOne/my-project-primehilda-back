import { IsInt, IsPositive, IsEnum, Min } from 'class-validator';
import { ProductType } from 'src/common/constants/product-types.enum';
import { OrderType } from 'src/common/constants/order-type.enum';

export class FreeOptionDto {
  @IsEnum(ProductType, { message: 'Categoría de regalo inválida' })
  category: ProductType;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity: number;
  @IsEnum(OrderType, { message: 'El tipo de orden debe ser NORMAL o EVENT' })
  orderType: OrderType;
}
