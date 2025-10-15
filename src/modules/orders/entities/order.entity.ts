import { Order as PrismaOrder } from '@prisma/client';

export class Order implements PrismaOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  createdByUserId: number;
  orderType: string;
  status: string;
  orderDate: Date;
  deliveryDate: Date;
  deliveryTime: string | null;
  deliveryMethod: string;
  deliveryAddressId: number | null;
  subtotal: number;
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
