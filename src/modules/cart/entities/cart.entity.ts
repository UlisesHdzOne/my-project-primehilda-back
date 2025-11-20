import { CartItemEntity } from './cart-item.entity';

export class CartEntity {
  id!: number;
  userId!: number;
  sessionId?: string | null;
  items!: CartItemEntity[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<CartEntity>) {
    Object.assign(this, partial);
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      return total + item.getTotalPrice();
    }, 0);
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}
