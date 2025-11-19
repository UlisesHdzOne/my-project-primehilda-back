import { Expose, Type } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dtos/responses/product-response.dto';

export class GiftRuleResponseDto {
  @Expose()
  id!: number;

  @Expose()
  principalProductId!: number;

  @Expose()
  @Type(() => ProductResponseDto)
  principalProduct?: ProductResponseDto;

  @Expose()
  allowedGiftIds!: number[];

  @Expose()
  maxFreeQuantity!: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<GiftRuleResponseDto>) {
    Object.assign(this, partial);
  }
}
