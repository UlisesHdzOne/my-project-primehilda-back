import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { CreatePaymentInput, OrderPaymentsSummary } from './types/payment.types';
import { OrderStatus, PaymentMethod } from '@/common/enums';

@Injectable()
export class PaymentService {
  private readonly logger = new AppLogger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  // ✅ MÉTODO create - SIMPLE Y FUNCIONAL
  async create(input: CreatePaymentInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearPayment', async () => {
      this.logger.log('Creando pago', { input });

      // Obtener orden con pagos
      const order = await this.prisma.washOrder.findUnique({
        where: { id: input.washOrderId },
        include: { payments: true },
      });

      this.errorUtils.validateEntityExists(order, 'WashOrder');

      // Validar estado
      const invalidStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
      if (invalidStatuses.includes(order!.status as OrderStatus)) {
        throw new BusinessRuleError(
          'INVALID_ORDER_STATUS',
          `No se puede pagar una orden ${order!.status}`,
        );
      }

      // Calcular saldo
      const totalPaid = order!.payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = order!.totalPrice - totalPaid;

      if (input.amount > remaining) {
        throw new BusinessRuleError(
          'PAYMENT_EXCEEDS_REMAINING',
          `El pago excede el saldo pendiente. Máximo: $${remaining.toFixed(2)}`,
        );
      }

      if (input.amount < 0.01) {
        throw new BusinessRuleError('INVALID_AMOUNT', 'El monto mínimo es $0.01');
      }

      // Crear pago
      const payment = await this.prisma.payment.create({
        data: {
          orderId: input.washOrderId,
          amount: input.amount,
          method: input.method,
        },
      });

      // Manejo automático de estados
      const newTotalPaid = totalPaid + input.amount;
      const isFullyPaid = newTotalPaid >= order!.totalPrice;

      if (isFullyPaid && order!.status === OrderStatus.PENDING) {
        await this.prisma.washOrder.update({
          where: { id: order!.id },
          data: {
            status: OrderStatus.IN_PROGRESS,
            startedAt: new Date(),
          },
        });
        this.logger.log(`Orden ${order!.id} pagada completamente → IN_PROGRESS`);
      }

      if (isFullyPaid && order!.status === OrderStatus.DONE) {
        this.logger.log(`Orden ${order!.id} pagada completamente, lista para entrega`);
      }

      this.logger.log('Pago creado exitosamente', { paymentId: payment.id });
      return payment;
    });
  }

  // ✅ MÉTODO findByOrder - SIMPLE Y FUNCIONAL
  // En el método findByOrder - VERSIÓN CORREGIDA
  async findByOrder(orderId: number): Promise<OrderPaymentsSummary> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarPagosPorOrden', async () => {
      this.logger.log('Buscando pagos por orden', { orderId });

      const [payments, order] = await Promise.all([
        this.prisma.payment.findMany({
          where: { orderId },
          orderBy: { date: 'desc' },
        }),
        this.prisma.washOrder.findUnique({
          where: { id: orderId },
        }),
      ]);

      this.errorUtils.validateEntityExists(order, 'WashOrder');

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = order!.totalPrice - totalPaid;

      // ✅ CONVERSIÓN EXPLÍCITA del enum de Prisma a tu enum
      const summary: OrderPaymentsSummary = {
        orderId,
        orderTotal: order!.totalPrice,
        totalPaid,
        remaining,
        payments: payments.map(payment => {
          // Convertir 'cash'/'card' de Prisma a PaymentMethod.CASH/PaymentMethod.CARD
          let method: PaymentMethod;

          if (payment.method === 'cash') {
            method = PaymentMethod.CASH;
          } else if (payment.method === 'card') {
            method = PaymentMethod.CARD;
          } else {
            // Fallback seguro
            method = PaymentMethod.CASH;
            this.logger.warn(
              `Método de pago desconocido: ${payment.method}, usando CASH por defecto`,
            );
          }

          return {
            id: payment.id,
            date: payment.date,
            amount: payment.amount,
            method: method, // ✅ Ahora es del tipo correcto
            orderId: payment.orderId,
          };
        }),
      };

      this.logger.debug('Resumen de pagos obtenido', {
        orderId,
        totalPaid,
        remaining,
        paymentCount: payments.length,
      });

      return summary;
    });
  }
}
