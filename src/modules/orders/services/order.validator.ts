import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../../../common/constants/order-status.enum';
import { ORDER_MESSAGES } from '../../../common/constants/order-messages';
import { OrderRules } from '../validators-business/rules/order.rules';

@Injectable()
export class OrdersValidator {
  constructor(private readonly prisma: PrismaService) {}

  // ====================================================================
  // REGLAS ASÍNCRONAS (Lógica de DB)
  // (Funciones helper movidas aquí desde el validador estático anterior)
  // ====================================================================

  async canUserCreateOrder(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });
    if (!user || !user.isActive) return false;
    return ['ADMIN', 'EDITOR'].includes(user.role);
  }

  async isValidCustomer(customerId: number): Promise<boolean> {
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
      select: { role: true, isActive: true },
    });
    if (!customer || !customer.isActive) return false;
    return customer.role === 'CONSUMER';
  }

  async isValidDeliveryAddress(
    addressId: number,
    customerId: number,
  ): Promise<boolean> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
      select: { userId: true, isActive: true },
    });
    if (!address || !address.isActive) return false;
    return address.userId === customerId;
  }

  async areProductsValid(productIds: number[]): Promise<{
    valid: boolean;
    missingIds?: number[];
    inactiveNames?: string[];
  }> {
    const uniqueProductIds = [...new Set(productIds)];
    if (uniqueProductIds.length === 0) return { valid: true };

    const products = await this.prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: { id: true, name: true, isActive: true },
    });

    if (products.length !== uniqueProductIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = uniqueProductIds.filter(
        (id) => !foundIds.includes(id),
      );
      return { valid: false, missingIds };
    }

    const inactive = products.filter((p) => !p.isActive);
    if (inactive.length)
      return { valid: false, inactiveNames: inactive.map((p) => p.name) };

    return { valid: true };
  }

  // ====================================================================
  // ORQUESTACIÓN (VALIDATE CREATE)
  // ====================================================================

  async validateCreate(
    dto: CreateOrderDto,
    createdByUserId: number,
  ): Promise<void> {
    const errors: string[] = [];

    // 1. Permisos del Creador
    if (!(await this.canUserCreateOrder(createdByUserId))) {
      throw new ForbiddenException(ORDER_MESSAGES.ONLY_ADMIN_EDITOR_CREATE);
    }

    // 2. Cliente
    if (!(await this.isValidCustomer(dto.customerId))) {
      errors.push(`customerId: ${ORDER_MESSAGES.CUSTOMER_INVALID_ROLE}`);
    }

    // 3. Fecha/hora (Regla Pura)
    if (
      !OrderRules.isValidDeliveryDateTime(dto.deliveryDate, dto.deliveryTime)
    ) {
      errors.push(`deliveryDate: ${ORDER_MESSAGES.INVALID_DATE}`);
    }

    // 4. Dirección si DELIVERY (Regla Pura + Validación DB)
    const addressRequiredValidation =
      OrderRules.validateDeliveryAddressRequired(
        dto.deliveryMethod,
        dto.deliveryAddressId,
      );
    if (!addressRequiredValidation.valid) {
      errors.push(`deliveryAddressId: ${addressRequiredValidation.error}`);
    } else if (dto.deliveryAddressId) {
      if (
        !(await this.isValidDeliveryAddress(
          dto.deliveryAddressId,
          dto.customerId,
        ))
      ) {
        errors.push(`deliveryAddressId: ${ORDER_MESSAGES.ADDRESS_NOT_BELONGS}`);
      }
    }

    // 5. Productos (Validación DB)
    const paidProductIds = dto.orderItems.map((i) => i.productId);
    const giftProductIds = dto.orderItems.flatMap((item) =>
      item.chosenGifts ? item.chosenGifts.map((gift) => gift.productId) : [],
    );
    const allProductIds = [...paidProductIds, ...giftProductIds];

    const productValidation = await this.areProductsValid(allProductIds);
    if (!productValidation.valid) {
      if (productValidation.missingIds) {
        errors.push(
          `${ORDER_MESSAGES.PRODUCT_NOT_FOUND} (Pagado o Regalo): ${productValidation.missingIds.join(', ')}`,
        );
      }
      if (productValidation.inactiveNames) {
        errors.push(
          `${ORDER_MESSAGES.PRODUCT_INACTIVE} (Pagado o Regalo): ${productValidation.inactiveNames.join(', ')}`,
        );
      }
    }

    // 6. Restricción de días (Regla Pura)
    const dayValidation = OrderRules.validateDeliveryDateByOrderType(
      dto.orderType,
      new Date(dto.deliveryDate),
    );
    if (!dayValidation.valid) {
      errors.push(`deliveryDate: ${dayValidation.error}`);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  // ====================================================================
  // ORQUESTACIÓN (VALIDATE UPDATE STATUS)
  // ====================================================================

  async validateUpdateStatus(
    id: number,
    newStatus: OrderStatus,
    confirmedDeliveryTime?: string,
  ): Promise<{ order: { status: string } }> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) {
      throw new NotFoundException(
        ORDER_MESSAGES.orderNotFound || 'Pedido no encontrado',
      );
    }

    // 1. Validar la transición de estado (Regla Pura)
    if (
      !OrderRules.isValidStatusTransition(
        order.status as OrderStatus,
        newStatus,
      )
    ) {
      throw new BadRequestException('Transición de estado no válida');
    }

    // 2. Lógica para estado CONFIRMED: Debe tener la hora prometida
    if (newStatus === OrderStatus.CONFIRMED && !confirmedDeliveryTime) {
      throw new BadRequestException(
        'Debe proporcionar la hora prometida de recogida/entrega al confirmar el pedido.',
      );
    }

    return { order };
  }
}
