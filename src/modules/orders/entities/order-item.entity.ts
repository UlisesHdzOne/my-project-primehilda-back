import { OrderItem as PrismaOrderItem } from '@prisma/client';

export class OrderItem implements PrismaOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isGift: boolean;
}
