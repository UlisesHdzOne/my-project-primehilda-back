import { PrismaService } from '../../../prisma/prisma.service';
import { OrderRules } from './rules/order.rules';
import { ErrorHelper } from '../../../common/helper/error.helper';
import { ORDER_MESSAGES } from '../../../common/constants/order-messages';
import { CreateOrderDto } from '../dto/create-order.dto';

interface FieldError {
  field: string;
  message: string;
}

export const OrderBusinessValidatorCreate = {
  validate: async (
    dto: CreateOrderDto,
    createdByUserId: number,
    prisma: PrismaService,
  ) => {
    const errors: FieldError[] = [];

    // 1. Creador
    const canCreate = await OrderRules.canUserCreateOrder(
      createdByUserId,
      prisma,
    );
    if (!canCreate)
      ErrorHelper.forbiddenException(ORDER_MESSAGES.ONLY_ADMIN_EDITOR_CREATE);

    // 2. Cliente
    const validCustomer = await OrderRules.isValidCustomer(
      dto.customerId,
      prisma,
    );
    if (!validCustomer)
      errors.push({
        field: 'customerId',
        message: ORDER_MESSAGES.CUSTOMER_INVALID_ROLE,
      });

    // 3. Fecha/hora entrega
    if (
      !OrderRules.isValidDeliveryDateTime(dto.deliveryDate, dto.deliveryTime)
    ) {
      errors.push({
        field: 'deliveryDate',
        message: ORDER_MESSAGES.INVALID_DATE,
      });
    }

    // 4. Dirección si DELIVERY
    if (OrderRules.requiresAddress(dto.deliveryMethod)) {
      if (!dto.deliveryAddressId) {
        errors.push({
          field: 'deliveryAddressId',
          message: ORDER_MESSAGES.ADDRESS_REQUIRED,
        });
      } else {
        const validAddress = await OrderRules.isValidDeliveryAddress(
          dto.deliveryAddressId,
          dto.customerId,
          prisma,
        );
        if (!validAddress)
          errors.push({
            field: 'deliveryAddressId',
            message: ORDER_MESSAGES.ADDRESS_NOT_BELONGS,
          });
      }
    }

    // 5. Productos
    const productIds = dto.orderItems.map((i) => i.productId);
    const productValidation = await OrderRules.areProductsValid(
      productIds,
      prisma,
    );
    if (!productValidation.valid) {
      if (productValidation.missingIds)
        errors.push({
          field: 'orderItems',
          message: `${ORDER_MESSAGES.PRODUCT_NOT_FOUND}: ${productValidation.missingIds.join(', ')}`,
        });
      if (productValidation.inactiveNames)
        errors.push({
          field: 'orderItems',
          message: `${ORDER_MESSAGES.PRODUCT_INACTIVE}: ${productValidation.inactiveNames.join(', ')}`,
        });
    }

    // 6. Cantidades
    for (const item of dto.orderItems) {
      if (item.quantity <= 0) {
        errors.push({
          field: 'orderItems',
          message: ORDER_MESSAGES.INVALID_QUANTITY,
        });
        break;
      }
    }

    if (errors.length > 0)
      ErrorHelper.badRequestException(
        errors.length === 1 ? errors[0].message : 'Validation failed',
        errors.length > 1 ? errors : undefined,
      );
  },
};
