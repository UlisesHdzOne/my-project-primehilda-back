import { OrderStatus } from '../../../../common/constants/order-status.enum';
import { DeliveryMethod } from '../../../../common/constants/delivery-method.enum';
import { OrderType } from '../../../../common/constants/order-type.enum';

const MIN_EVENT_TOTAL = 1000;
export const OrderRules = {
  /**
   * REGLA: La fecha y hora de entrega deben tener un mínimo de 2 horas de adelanto.
   */
  isValidDeliveryDateTime(deliveryDate: string, deliveryTime: string): boolean {
    const now = new Date();
    const [year, month, day] = deliveryDate.split('-').map(Number);
    const [hh, mm] = deliveryTime.split(':').map(Number);

    const delivery = new Date(year, month - 1, day, hh, mm, 0);
    const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

    return delivery.getTime() >= now.getTime() + MIN_ADVANCE_MS;
  },

  /**
   * REGLA: Define si es posible la transición de un estado de pedido a otro.
   */
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

  /**
   * REGLA: Eventos requieren mínimo $1000 de subtotal.
   */
  validateOrderTypeByTotal(
    orderType: OrderType,
    subtotal: number,
  ): { valid: boolean; error?: string } {
    if (orderType === OrderType.EVENT && subtotal < MIN_EVENT_TOTAL) {
      return {
        valid: false,
        error: `Los pedidos de Evento requieren un subtotal mínimo de $${MIN_EVENT_TOTAL}.`,
      };
    }
    return { valid: true };
  },

  /**
   * REGLA: Restricción de días por tipo de pedido: Normal solo viernes, sábado y domingo.
   */
  validateDeliveryDateByOrderType(
    orderType: OrderType,
    deliveryDate: Date,
  ): { valid: boolean; error?: string } {
    const dayOfWeek = deliveryDate.getDay(); // 0 = Domingo, 6 = Sábado

    if (orderType === OrderType.NORMAL) {
      if (![0, 5, 6].includes(dayOfWeek)) {
        return {
          valid: false,
          error:
            'Las ventas normales solo están disponibles viernes, sábado y domingo',
        };
      }
    }
    return { valid: true };
  },

  /**
   * REGLA: Dirección requerida para delivery si el método es DELIVERY.
   */
  validateDeliveryAddressRequired(
    deliveryMethod: DeliveryMethod,
    deliveryAddressId?: number,
  ): { valid: boolean; error?: string } {
    if (deliveryMethod === DeliveryMethod.DELIVERY && !deliveryAddressId) {
      return {
        valid: false,
        error: 'Se requiere una dirección de entrega para delivery',
      };
    }
    return { valid: true };
  },
};
