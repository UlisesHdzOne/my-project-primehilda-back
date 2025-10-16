import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../../../common/constants/order-status.enum';
import { Prisma } from '@prisma/client';
import { OrderCalculatorService } from './order-calculator.service';
import { OrderNumberGeneratorService } from './order-number-generator.service';
import { OrderRules } from '../validators-business/rules/order.rules';
import { OrdersValidator } from './order.validator';
import { FilterOrdersDto } from '../dto/filter-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersValidator: OrdersValidator, // ✅ Orquesta la validación
    private readonly calculator: OrderCalculatorService, // ✅ Lógica de cálculo
    private readonly numberGenerator: OrderNumberGeneratorService, // ✅ Generación especializada
  ) {}

  // ====================================================================
  // MÉTODOS CRUD (ORQUESTACIÓN)
  // ====================================================================

  async create(dto: CreateOrderDto, createdByUserId: number): Promise<Order> {
    // 1. Validación (Delegada)
    await this.ordersValidator.validateCreate(dto, createdByUserId);

    // 2. CÁLCULO DE ITEMS Y REGALOS (Delegada a servicio especializado)
    const { calculatedItems, subtotal } =
      await this.calculator.calculateItemsAndGifts(
        dto.orderItems,
        dto.orderType,
      );

    // 3. VALIDACIÓN FINAL DE NEGOCIO (Regla Pura: Monto Mínimo de Evento)
    const totalValidation = OrderRules.validateOrderTypeByTotal(
      dto.orderType,
      subtotal,
    );
    if (!totalValidation.valid) {
      throw new BadRequestException(totalValidation.error!);
    }

    // 4. GENERACIÓN DE NÚMERO DE ORDEN (Delegada a servicio especializado)
    const orderNumber = await this.numberGenerator.generate();

    // 5. PREPARACIÓN DE DATOS FINALES
    const finalOrderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

    calculatedItems.forEach((item) => {
      // Item pagado o exceso cobrado
      finalOrderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        isGift: false,
      });
      // Items de Regalo (isGift: true)
      item.gifts.forEach((gift) => {
        finalOrderItemsData.push({
          productId: gift.productId,
          quantity: gift.quantity,
          unitPrice: 0,
          subtotal: 0,
          isGift: true,
        });
      });
    });

    // 6. PERSISTENCIA
    const deliveryDate = new Date(dto.deliveryDate);
    const deliveryTime = dto.deliveryTime || null;

    return this.prisma.order.create({
      data: {
        ...dto,
        orderNumber,
        createdByUserId,
        status: OrderStatus.PENDING,
        deliveryDate,
        deliveryTime,
        deliveryAddressId: dto.deliveryAddressId || null,
        subtotal,
        total: subtotal,
        notes: dto.notes || null,
        orderItems: { create: finalOrderItemsData },
      },
      include: {
        customer: true,
        deliveryAddress: true,
        orderItems: { include: { product: true } },
      },
    }) as Promise<Order>;
  }

  async findAll(filters?: FilterOrdersDto) {
    // 1. Tipar correctamente la cláusula 'where' usando el tipo de Prisma
    const whereClause: Prisma.OrderWhereInput = {};

    // 2. Asignación segura de 'status'
    if (filters?.status) {
      // filters.status ya es string | undefined, seguro de asignar
      whereClause.status = filters.status;
    }

    // 3. Asignación segura de 'customerId'
    if (filters?.customerId) {
      // La propiedad customerId en OrderWhereInput espera un number
      // Ya estamos convirtiendo con Number()
      whereClause.customerId = Number(filters.customerId);
    }

    if (filters?.orderType) {
      whereClause.orderType = filters.orderType;
    }

    // 4. Ejecutar la consulta
    return this.prisma.order.findMany({
      where: whereClause, // <--- whereClause ya está tipado como Prisma.OrderWhereInput
      include: {
        customer: true,
        deliveryAddress: true,
        orderItems: { include: { product: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async findOne(id: number) {
    // 1. Buscar por ID único
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        deliveryAddress: true, // Opcional, si lo quieres incluir
        orderItems: { include: { product: true } },
      },
    });

    // 2. Manejo de error si no se encuentra
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }

    return order;
  }

  async updateStatus(
    id: number,
    status: OrderStatus,
    confirmedDeliveryTime?: string,
  ) {
    // 1. Validar (Delegada)
    await this.ordersValidator.validateUpdateStatus(
      id,
      status,
      confirmedDeliveryTime,
    );

    const updateData: Prisma.OrderUpdateInput = { status };

    // 2. Lógica para estado CONFIRMED
    if (status === OrderStatus.CONFIRMED) {
      updateData.deliveryTime = confirmedDeliveryTime;
    }

    // 3. Actualizar
    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { customer: true, orderItems: { include: { product: true } } },
    });
  }

  async cancel(id: number) {
    // 1. Validar (Delegada)
    await this.ordersValidator.validateUpdateStatus(id, OrderStatus.CANCELLED);

    // 2. Ejecutar
    return this.updateStatus(id, OrderStatus.CANCELLED);
  }
}
