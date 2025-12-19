// src/modules/payment/payment.service.ts - VERSIÓN CORREGIDA
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { Logger } from '@nestjs/common';
import { CreatePaymentInput } from './types/payment.types';
import { OrderStatus } from '@/common/enums';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreatePaymentInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearPayment', async () => {
      this.logger.log('Creando pago', input);

      // Obtener orden con pagos
      const order = await this.prisma.washOrder.findUnique({
        where: { id: input.washOrderId },
        include: { payments: true },
      });

      this.errorUtils.validateEntityExists(order, 'WashOrder');

      // ✅✅✅ REGLA CORREGIDA: Permitir pagos en PENDING, solo bloquear terminadas
      const invalidStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
      if (invalidStatuses.includes(order!.status as OrderStatus)) {
        throw new BusinessRuleError(
          'INVALID_ORDER_STATUS',
          `No se puede pagar una orden ${order!.status}`,
        );
      }
      // ❌ ELIMINAR: La validación que bloquea PENDING

      // Calcular pagos existentes y saldo pendiente
      const totalPaid = order!.payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = order!.totalPrice - totalPaid;

      // Validar que el pago no exceda lo restante
      if (input.amount > remaining) {
        throw new BusinessRuleError(
          'PAYMENT_EXCEEDS_REMAINING',
          `El pago excede el saldo pendiente. ` + `Máximo permitido: $${remaining.toFixed(2)}`,
        );
      }

      // Validar monto mínimo
      if (input.amount < 0.01) {
        throw new BusinessRuleError('INVALID_AMOUNT', 'El monto mínimo de pago es $0.01');
      }

      // Crear el pago
      const payment = await this.prisma.payment.create({
        data: {
          orderId: input.washOrderId,
          amount: input.amount,
          method: input.method,
        },
      });

      // ✅ LÓGICA MEJORADA: Manejo automático de estados
      const newTotalPaid = totalPaid + input.amount;
      const isFullyPaid = newTotalPaid >= order!.totalPrice;

      // Si se pagó completamente y la orden está PENDING → pasar a IN_PROGRESS
      if (isFullyPaid && order!.status === OrderStatus.PENDING) {
        await this.prisma.washOrder.update({
          where: { id: order!.id },
          data: {
            status: OrderStatus.IN_PROGRESS,
            startedAt: new Date(),
          },
        });
        this.logger.log(
          `Orden ${order!.id} pagada completamente, pasando automáticamente a IN_PROGRESS`,
        );
      }

      // Si se pagó completamente y la orden está DONE → log solamente
      // (la entrega requiere acción explícita via updateStatus)
      if (isFullyPaid && order!.status === OrderStatus.DONE) {
        this.logger.log(`Orden ${order!.id} completamente pagada, lista para ser entregada`);
      }

      return payment;
    });
  }

  async findByOrder(orderId: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarPagosPorOrden', async () => {
      const payments = await this.prisma.payment.findMany({
        where: { orderId },
        orderBy: { date: 'desc' },
      });

      const order = await this.prisma.washOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw this.errorUtils.validateEntityExists(null, 'WashOrder');
      }

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      return {
        orderId,
        orderTotal: order.totalPrice,
        totalPaid,
        remaining: order.totalPrice - totalPaid,
        payments,
      };
    });
  }
}
