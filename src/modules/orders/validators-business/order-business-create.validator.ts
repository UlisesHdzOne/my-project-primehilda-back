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

    // 1. Permisos del Creador
    const canCreate = await OrderRules.canUserCreateOrder(
      createdByUserId,
      prisma,
    );
    if (!canCreate) {
      ErrorHelper.forbiddenException(ORDER_MESSAGES.ONLY_ADMIN_EDITOR_CREATE);
    }

    // 2. Cliente (Consumer activo)
    const validCustomer = await OrderRules.isValidCustomer(
      dto.customerId,
      prisma,
    );
    if (!validCustomer) {
      errors.push({
        field: 'customerId',
        message: ORDER_MESSAGES.CUSTOMER_INVALID_ROLE,
      });
    }

    // 3. Fecha/hora entrega (Mínimo 2 horas de adelanto)
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
        if (!validAddress) {
          errors.push({
            field: 'deliveryAddressId',
            message: ORDER_MESSAGES.ADDRESS_NOT_BELONGS,
          });
        }
      }
    }

    // 5. Productos (Existen y están activos) - 🚀 Lógica de regalo integrada

    // Recolectar IDs de productos pagados
    const paidProductIds = dto.orderItems.map((i) => i.productId);

    // Recolectar IDs de productos elegidos como regalo
    const giftProductIds = dto.orderItems.flatMap((item) =>
      item.chosenGifts ? item.chosenGifts.map((gift) => gift.productId) : [],
    );

    // Combinar todos los IDs para la validación de existencia y actividad
    const allProductIds = [...paidProductIds, ...giftProductIds];

    const productValidation = await OrderRules.areProductsValid(
      allProductIds,
      prisma,
    );
    if (!productValidation.valid) {
      if (productValidation.missingIds) {
        errors.push({
          field: 'orderItems',
          message: `${ORDER_MESSAGES.PRODUCT_NOT_FOUND} (Pagado o Regalo): ${productValidation.missingIds.join(', ')}`,
        });
      }
      if (productValidation.inactiveNames) {
        errors.push({
          field: 'orderItems',
          message: `${ORDER_MESSAGES.PRODUCT_INACTIVE} (Pagado o Regalo): ${productValidation.inactiveNames.join(', ')}`,
        });
      }
    }

    // 6. Otras Reglas de Negocio
    const businessValidations = [
      // ✅ Restricción de días para ventas normales
      OrderRules.validateDeliveryDateByOrderType(
        dto.orderType,
        new Date(dto.deliveryDate),
      ),

      // ✅ Dirección requerida para delivery
      OrderRules.validateDeliveryAddressRequired(
        dto.deliveryMethod,
        dto.deliveryAddressId,
      ),
    ];

    // Agregar errores de negocio a la lista de errores
    businessValidations.forEach((validation) => {
      if (!validation.valid && validation.error) {
        errors.push({
          field: 'businessRules',
          message: validation.error,
        });
      }
    });

    // 7. Lanzamiento de Excepción si hay Errores
    if (errors.length > 0) {
      ErrorHelper.badRequestException(
        errors.length === 1 ? errors[0].message : 'Validation failed',
        errors.length > 1 ? errors : undefined,
      );
    }
  },
};
