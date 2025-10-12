import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../../../common/constants/order-status.enum';
import { Prisma } from '@prisma/client';
import { generateOrderNumber } from '../../../utils/order-number.generator';
import { OrderBusinessValidatorCreate } from '../validators-business/order-business-create.validator';
import { OrderRules } from '../validators-business/rules/order.rules';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, createdByUserId: number): Promise<Order> {
    await OrderBusinessValidatorCreate.validate(
      dto,
      createdByUserId,
      this.prisma,
    );

    const productIds = dto.orderItems.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { freeOptions: true },
    });

    let subtotal = 0;
    let freeSoupsAvailable = 0;
    let freeSoupsUsed = 0;

    const orderItemsData = dto.orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      const itemFreeSoups = OrderRules.calculateFreeSoupsForProduct(
        product.freeOptions,
        item.quantity,
      );
      freeSoupsAvailable += itemFreeSoups;

      if (item.freeSoups?.length)
        freeSoupsUsed += item.freeSoups.reduce((sum, s) => sum + s.quantity, 0);

      return {
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
        freeSoups: item.freeSoups
          ? (item.freeSoups as unknown as Prisma.InputJsonValue)
          : undefined,
      };
    });

    const lastOrder = await this.getLastOrderOfToday();
    const orderNumber = generateOrderNumber(lastOrder?.orderNumber);

    const [hh, mm] = dto.deliveryTime.split(':').map((n) => +n);
    const deliveryDate = new Date(dto.deliveryDate);
    if (!Number.isNaN(hh) && !Number.isNaN(mm))
      deliveryDate.setHours(hh, mm, 0, 0);

    return this.prisma.order.create({
      data: {
        orderNumber,
        customerId: dto.customerId,
        createdByUserId,
        orderType: dto.orderType,
        status: OrderStatus.PENDING,
        deliveryDate,
        deliveryTime: dto.deliveryTime,
        deliveryMethod: dto.deliveryMethod,
        deliveryAddressId: dto.deliveryAddressId || null,
        subtotal,
        total: subtotal,
        freeSoupsAvailable,
        freeSoupsUsed,
        notes: dto.notes || null,
        orderItems: { create: orderItemsData },
      },
      include: {
        customer: true,
        deliveryAddress: true,
        orderItems: { include: { product: true } },
      },
    });
  }

  private async getLastOrderOfToday(): Promise<{ orderNumber: string } | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.prisma.order.findFirst({
      where: { createdAt: { gte: today, lt: tomorrow } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
  }

  // Listar pedidos
  async findAll(filters?: { status?: string; customerId?: number }) {
    return this.prisma.order.findMany({
      where: filters,
      include: { customer: true, orderItems: { include: { product: true } } },
    });
  }

  // Obtener pedido por ID
  async findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, orderItems: { include: { product: true } } },
    });
  }

  // Actualizar estado
  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Pedido no encontrado');
    if (
      !OrderRules.isValidStatusTransition(order.status as OrderStatus, status)
    )
      throw new Error('Transición de estado no válida');

    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  // Cancelar pedido
  async cancel(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Pedido no encontrado');
    return this.updateStatus(id, OrderStatus.CANCELLED);
  }
}
