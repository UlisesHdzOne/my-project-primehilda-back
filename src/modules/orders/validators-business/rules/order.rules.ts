import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStatus } from '../../../../common/constants/order-status.enum';
import { DeliveryMethod } from '../../../../common/constants/delivery-method.enum';
import { OrderType } from '../../../../common/constants/order-type.enum'; // Asegúrate que esta ruta sea correcta

const MIN_EVENT_TOTAL = 1000;
export const OrderRules = {
  // ========== REGLAS EXISTENTES ==========
  /**
   * REGLA: Verifica si un usuario (por su rol y estado) puede crear un pedido.
   */
  async canUserCreateOrder(
    userId: number,
    prisma: PrismaService,
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });
    if (!user || !user.isActive) return false;
    // Solo ADMIN y EDITOR pueden crear pedidos
    return ['ADMIN', 'EDITOR'].includes(user.role);
  },

  /**
   * REGLA: Verifica si el customerId corresponde a un usuario consumidor activo.
   */
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

  /**
   * REGLA: La fecha y hora de entrega deben tener un mínimo de 2 horas de adelanto.
   */
  isValidDeliveryDateTime(deliveryDate: string, deliveryTime: string): boolean {
    const now = new Date();

    // Descomponer deliveryDate y deliveryTime
    const [year, month, day] = deliveryDate.split('-').map(Number);
    const [hh, mm] = deliveryTime.split(':').map(Number);

    // Construir fecha de entrega usando hora local (importante el month - 1)
    const delivery = new Date(year, month - 1, day, hh, mm, 0);

    // Diferencia mínima en milisegundos (2 horas)
    const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

    return delivery.getTime() >= now.getTime() + MIN_ADVANCE_MS;
  },

  /**
   * REGLA: Verifica que la dirección de entrega exista y pertenezca al cliente.
   */
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

  /**
   * REGLA: Indica si el método de entrega requiere una dirección (solo DELIVERY).
   */
  requiresAddress(deliveryMethod: DeliveryMethod): boolean {
    return deliveryMethod === DeliveryMethod.DELIVERY;
  },

  /**
   * REGLA: Verifica que todos los productos existan y estén activos.
   * Acepta un array combinado de IDs de productos pagados y de regalo.
   */
  async areProductsValid(productIds: number[], prisma: PrismaService) {
    // ⚠️ CORRECCIÓN CLAVE: Usamos Set para eliminar duplicados
    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length === 0) return { valid: true };

    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: { id: true, name: true, isActive: true },
    });

    // 1. Verificar si faltan IDs (no existen en la DB)
    if (products.length !== uniqueProductIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = uniqueProductIds.filter(
        (id) => !foundIds.includes(id),
      );
      return { valid: false, missingIds };
    }

    // 2. Verificar si están inactivos
    const inactive = products.filter((p) => !p.isActive);
    if (inactive.length)
      return { valid: false, inactiveNames: inactive.map((p) => p.name) };

    return { valid: true };
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
  // ====================================================================
  // 2. NUEVAS REGLAS DE NEGOCIO (Tipo de Pedido, Días y Monto)
  // ====================================================================

  /**
   * REGLA: Eventos requieren mínimo $1000 de subtotal.
   * Se usa en OrdersService, NO en el validador de negocio (antes de la DB).
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
    // Se usa Date para permitir la manipulación de la fecha
    deliveryDate: Date,
  ): { valid: boolean; error?: string } {
    const dayOfWeek = deliveryDate.getDay(); // 0 = Domingo, 6 = Sábado

    if (orderType === OrderType.NORMAL) {
      // Solo viernes (5), sábado (6), domingo (0)
      if (![0, 5, 6].includes(dayOfWeek)) {
        return {
          valid: false,
          error:
            'Las ventas normales solo están disponibles viernes, sábado y domingo',
        };
      }
    }
    // Eventos pueden ser cualquier día
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
    // La regla 'requiresAddress' ya cubre esto, pero esta versión devuelve un error descriptivo.
    return { valid: true };
  },
};
