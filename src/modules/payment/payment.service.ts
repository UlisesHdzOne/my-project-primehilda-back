import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { Logger } from '@nestjs/common';
import { CreatePaymentInput } from './types/payment.types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  create(input: CreatePaymentInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearPayment', async () => {
      this.logger.log('Creando pago', input);

      const order = await this.prisma.washOrder.findUnique({
        where: { id: input.washOrderId },
        include: { payments: true },
      });

      this.errorUtils.validateEntityExists(order, 'WashOrder');

      if (order!.status === 'pending') {
        throw new BusinessRuleError('ORDER_NOT_STARTED', 'No se puede pagar una orden pendiente');
      }

      const paid = order!.payments.reduce((a, p) => a + p.amount, 0);
      const remaining = order!.totalPrice - paid;

      if (input.amount > remaining) {
        throw new BusinessRuleError('PAYMENT_EXCEEDS_TOTAL', 'El pago excede el total de la orden');
      }

      // 👉 crear pago
      const payment = await this.prisma.payment.create({
        data: {
          orderId: input.washOrderId,
          amount: input.amount,
          method: input.method,
        },
      });

      // 👉 validar si ya quedó completamente pagada
      const newPaid = paid + input.amount;

      if (newPaid === order!.totalPrice && order!.status === 'in_progress') {
        await this.prisma.washOrder.update({
          where: { id: order!.id },
          data: { status: 'done' },
        });
      }

      return payment;
    });
  }
}
