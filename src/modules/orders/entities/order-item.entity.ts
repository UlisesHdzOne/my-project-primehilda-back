import { OrderItem as PrismaOrderItem } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class OrderItem implements PrismaOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  freeSoups: Prisma.JsonValue | null;
}
