import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../../../common/constants/order-status.enum';
import { Prisma } from '@prisma/client';
import { generateOrderNumber } from '../../../utils/order-number.generator';
import { OrderBusinessValidatorCreate } from '../validators-business/order-business-create.validator';
import { OrderRules } from '../validators-business/rules/order.rules';
import { OrderType } from 'src/common/constants/order-type.enum';
import { ErrorHelper } from 'src/common/helper/error.helper';
import { OrderItemDto } from '../dto/order-item.dto';

// Interfaz auxiliar para llevar el control de los límites de regalo por categoría
interface GiftLimit {
  allowedQuantity: number;
  category: string;
}

// Nuevo tipo para un item de regalo
type GiftItem = {
  productId: number; // Ahora es OBLIGATORIO el ID específico de la elección
  category: string;
  quantity: number;
  unitPrice: number;
};

// Interfaz para el resultado del cálculo
interface CalculatedItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  gifts: GiftItem[];
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, createdByUserId: number): Promise<Order> {
    // 1. Validación de Negocio (Cliente, Dirección, Días, Productos)
    await OrderBusinessValidatorCreate.validate(
      dto,
      createdByUserId,
      this.prisma,
    );

    // 2. CÁLCULO DE ITEMS Y REGALOS
    const { calculatedItems, subtotal } = await this.calculateItemsAndGifts(
      dto.orderItems,
      dto.orderType,
    );

    // 3. VALIDACIÓN FINAL DE NEGOCIO (Monto Mínimo de Evento)
    const totalValidation = OrderRules.validateOrderTypeByTotal(
      dto.orderType,
      subtotal,
    );
    if (!totalValidation.valid) {
      ErrorHelper.badRequestException(totalValidation.error!);
    }

    // 4. PREPARACIÓN DE DATOS FINALES
    const lastOrder = await this.getLastOrderOfToday();
    const orderNumber = generateOrderNumber(lastOrder?.orderNumber);

    const finalOrderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

    calculatedItems.forEach((item) => {
      // 4a. Item principal (pagado) O ITEM DE REGALO EXCEDIDO (COBRADO)
      finalOrderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        isGift: false,
      });

      // 4b. Items de Regalo (costo 0)
      item.gifts.forEach((gift) => {
        finalOrderItemsData.push({
          productId: gift.productId,
          quantity: gift.quantity,
          unitPrice: 0, // Siempre 0 para regalos
          subtotal: 0, // Siempre 0 para regalos
          isGift: true,
        });
      });
    });

    // 5. CREACIÓN DE LA ORDEN
    const deliveryDate = new Date(dto.deliveryDate);

    return this.prisma.order.create({
      data: {
        orderNumber,
        customerId: dto.customerId,
        createdByUserId,
        orderType: dto.orderType,
        status: OrderStatus.PENDING,
        deliveryDate,
        deliveryTime: null,
        deliveryMethod: dto.deliveryMethod,
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

  // ====================================================================
  // FUNCIÓN AUXILIAR DE CÁLCULO Y REGALOS (Lógica ÚNICA: Elección y Exceso)
  // ====================================================================
  private async calculateItemsAndGifts(
    items: OrderItemDto[],
    orderType: OrderType,
  ): Promise<{ calculatedItems: CalculatedItem[]; subtotal: number }> {
    let subtotal = 0;

    // 1. Recopilar todos los IDs de productos (pagados y elegidos como regalo)
    const productIds = items.map((item) => item.productId);
    const giftProductIds = items
      .flatMap((item) => item.chosenGifts || [])
      .map((gift) => gift.productId);

    const allProductIds = [...new Set([...productIds, ...giftProductIds])];

    // Obtener todos los productos y sus reglas (freeOptions)
    const allProducts = await this.prisma.product.findMany({
      where: { id: { in: allProductIds } },
      include: {
        freeOptions: {
          select: { category: true, quantity: true, orderType: true },
        },
      },
    });

    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const calculatedItems: CalculatedItem[] = [];

    // Definimos el tipo exacto que esperamos que traiga la relación de Prisma
    type PrismaFreeOption = {
      category: string;
      quantity: number;
      orderType: string;
    };

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      // A) Cálculo del Item Principal Pagado (No regalo)
      const itemPrice = product.price * item.quantity;
      subtotal += itemPrice;

      // B) Determinación del Límite de Regalos para este producto y tipo de orden
      const limits = new Map<string, GiftLimit>();
      const safeFreeOptions = product.freeOptions as PrismaFreeOption[];

      safeFreeOptions
        .filter((opt) => opt.orderType === (orderType as string))
        .forEach((opt) => {
          // Límite total de regalos por categoría, multiplicado por la cantidad del producto principal
          const allowedQuantity = opt.quantity * item.quantity;
          limits.set(opt.category, { allowedQuantity, category: opt.category });
        });

      const finalGifts: GiftItem[] = [];

      // C) Procesamiento de los Regalos Elegidos por el Cliente (chosenGifts)
      if (item.chosenGifts && item.chosenGifts.length > 0) {
        for (const chosenGift of item.chosenGifts) {
          const giftProduct = productMap.get(chosenGift.productId);

          // Validación: El producto de regalo elegido debe existir y tener una categoría
          if (!giftProduct) {
            ErrorHelper.badRequestException(
              `El producto de regalo elegido (ID: ${chosenGift.productId}) no existe.`,
            );
          }

          const limit = limits.get(giftProduct.category);

          let freeQty = 0;
          let paidQty = 0;

          // ⚠️ Lógica Central: Separar GRATIS (consume límite) vs COBRADO (exceso)
          if (limit) {
            const remainingLimit = limit.allowedQuantity;

            if (chosenGift.quantity <= remainingLimit) {
              // Caso 1: Todo es GRATIS
              freeQty = chosenGift.quantity;
              limit.allowedQuantity -= freeQty; // Consumir el límite
            } else {
              // Caso 2: Se excede el límite (Parte GRATIS, parte COBRADA)
              freeQty = remainingLimit;
              paidQty = chosenGift.quantity - remainingLimit;
              limit.allowedQuantity = 0; // Se agota el límite
            }
          } else {
            // Caso 3: No hay regla de regalo para esta categoría, todo es COBRADO
            // Esto solo debería pasar si el cliente eligió una categoría no permitida para regalo
            paidQty = chosenGift.quantity;
          }

          // D) Guardar el Regalo (GRATIS)
          if (freeQty > 0) {
            finalGifts.push({
              productId: chosenGift.productId,
              category: giftProduct.category,
              quantity: freeQty,
              unitPrice: 0,
            });
          }

          // E) Guardar el Exceso (COBRADO) como un item separado
          if (paidQty > 0) {
            const paidPrice = giftProduct.price * paidQty;
            subtotal += paidPrice; // Aumentar el subtotal con el costo de los productos extra

            // Agregamos el ítem cobrado como un ítem pagado separado a la lista final
            calculatedItems.push({
              productId: chosenGift.productId,
              quantity: paidQty,
              unitPrice: giftProduct.price,
              subtotal: paidPrice,
              gifts: [], // Los ítems cobrados no generan regalos
            });
          }
        }
      }

      // F) Agregar el item principal pagado (que no fue un regalo)
      calculatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemPrice,
        gifts: finalGifts, // Solo los regalos GRATIS asociados
      });
    }

    return { calculatedItems, subtotal };
  }

  // ====================================================================
  // MÉTODOS EXISTENTES
  // ====================================================================

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

  // Actualizar estado (ahora recibe confirmedDeliveryTime)
  async updateStatus(
    id: number,
    status: OrderStatus,
    confirmedDeliveryTime?: string, // Nuevo parámetro
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // 1. Validar la transición de estado
    if (
      !OrderRules.isValidStatusTransition(order.status as OrderStatus, status)
    )
      throw new BadRequestException('Transición de estado no válida');

    const updateData: Prisma.OrderUpdateInput = { status };

    // 2. Lógica para estado CONFIRMED: Establecer la hora prometida
    if (status === OrderStatus.CONFIRMED) {
      if (!confirmedDeliveryTime) {
        throw new BadRequestException(
          'Debe proporcionar la hora prometida de recogida/entrega al confirmar el pedido.',
        );
      }
      updateData.deliveryTime = confirmedDeliveryTime;
    }

    // 3. Actualizar
    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { customer: true, orderItems: { include: { product: true } } },
    });
  }

  // Cancelar pedido
  async cancel(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Reutilizamos el método de actualización de estado
    return this.updateStatus(id, OrderStatus.CANCELLED);
  }
}
