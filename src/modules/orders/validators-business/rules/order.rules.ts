import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStatus } from '../../../../common/constants/order-status.enum';
import { ProductType } from '../../../../common/constants/product-types.enum';
import { DeliveryMethod } from '../../../../common/constants/delivery-method.enum';

export const OrderRules = {
  async canUserCreateOrder(
    userId: number,
    prisma: PrismaService,
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });
    if (!user || !user.isActive) return false;
    return ['ADMIN', 'EDITOR'].includes(user.role);
  },

  async isValidCustomer(
    customerId: number,
    prisma: PrismaService,
  ): Promise<boolean> {
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { role: true, isActive: true },
    });
    if (!customer || !customer.isActive) return false;
    return customer.role === 'CONSUMER';
  },

  isValidDeliveryDateTime(deliveryDate: string, deliveryTime: string): boolean {
    const now = new Date();

    // Descomponer deliveryDate y deliveryTime
    const [year, month, day] = deliveryDate.split('-').map(Number);
    const [hh, mm] = deliveryTime.split(':').map(Number);

    // Construir fecha de entrega usando hora local
    const delivery = new Date(year, month - 1, day, hh, mm, 0);

    // Diferencia mínima en milisegundos (2 horas)
    const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

    return delivery.getTime() >= now.getTime() + MIN_ADVANCE_MS;
  },

  async isValidDeliveryAddress(
    addressId: number,
    customerId: number,
    prisma: PrismaService,
  ): Promise<boolean> {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: { userId: true, isActive: true },
    });
    if (!address || !address.isActive) return false;
    return address.userId === customerId;
  },

  requiresAddress(deliveryMethod: DeliveryMethod): boolean {
    return deliveryMethod === DeliveryMethod.DELIVERY;
  },

  async areProductsValid(productIds: number[], prisma: PrismaService) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, isActive: true },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return { valid: false, missingIds };
    }

    const inactive = products.filter((p) => !p.isActive);
    if (inactive.length)
      return { valid: false, inactiveNames: inactive.map((p) => p.name) };

    return { valid: true };
  },

  calculateFreeSoupsForProduct(
    freeOptions: Array<{ category: string; quantity: number }>,
    itemQuantity: number,
  ): number {
    return freeOptions
      .filter((opt) => opt.category === ProductType.SOPA.toString())
      .reduce((sum, opt) => sum + opt.quantity * itemQuantity, 0);
  },

  isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };
    return transitions[currentStatus]?.includes(newStatus) ?? false;
  },
};
