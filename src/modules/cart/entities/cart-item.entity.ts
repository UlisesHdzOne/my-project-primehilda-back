export class CartItemEntity {
  id!: number;
  cartId!: number;
  productId!: number;
  product!: any; // Usamos any temporalmente para evitar errores
  quantity!: number;
  isGift!: boolean;
  giftFromProductId?: number | null;
  createdAt!: Date;

  constructor(partial: Partial<CartItemEntity>) {
    Object.assign(this, partial);
  }

  getTotalPrice(): number {
    if (this.isGift) {
      return 0;
    }
    return (this.product?.price || 0) * this.quantity;
  }
}
