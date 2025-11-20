import { Expose, Type } from 'class-transformer';

class CartItemResponseDto {
  @Expose()
  id!: number;

  @Expose()
  productId!: number;

  @Expose()
  product!: any;

  @Expose()
  quantity!: number;

  @Expose()
  isGift!: boolean;

  @Expose()
  giftFromProductId?: number | null;

  @Expose()
  totalPrice!: number;

  @Expose()
  createdAt!: Date;
}

export class CartResponseDto {
  @Expose()
  id!: number;

  @Expose()
  userId!: number;

  @Expose()
  @Type(() => CartItemResponseDto)
  items!: CartItemResponseDto[];

  @Expose()
  totalPrice!: number;

  @Expose()
  totalItems!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<CartResponseDto>) {
    Object.assign(this, partial);
  }
}
