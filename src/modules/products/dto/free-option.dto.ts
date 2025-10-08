import { ProductType } from 'src/common/constants/product-types.enum';
import { IsEnum, IsNumber } from 'class-validator';

export class FreeOptionDto {
  @IsEnum(ProductType)
  category: ProductType; // Ahora se llama category

  @IsNumber()
  quantity: number;
}
