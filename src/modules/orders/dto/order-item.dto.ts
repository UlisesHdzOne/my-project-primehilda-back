import {
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ORDER_MESSAGES } from 'src/common/constants/order-messages';

export class FreeSoupDto {
  @IsInt({ message: ORDER_MESSAGES.sopaProductoInvalido })
  @IsPositive({ message: ORDER_MESSAGES.sopaProductoInvalido })
  productId: number;

  @IsInt({ message: ORDER_MESSAGES.cantidadSopaInvalida })
  @Min(1, { message: ORDER_MESSAGES.cantidadSopaInvalida })
  quantity: number;

  @IsString({ message: ORDER_MESSAGES.nombreSopaInvalido })
  name: string;
}

export class OrderItemDto {
  @IsInt({ message: ORDER_MESSAGES.productoInvalido })
  @IsPositive({ message: ORDER_MESSAGES.productoInvalido })
  productId: number;

  @IsInt({ message: ORDER_MESSAGES.cantidadProductoInvalida })
  @Min(1, { message: ORDER_MESSAGES.cantidadProductoInvalida })
  quantity: number;

  @IsOptional()
  @IsArray({ message: ORDER_MESSAGES.sopasInvalidas })
  @ValidateNested({ each: true })
  @Type(() => FreeSoupDto)
  freeSoups?: FreeSoupDto[];
}
