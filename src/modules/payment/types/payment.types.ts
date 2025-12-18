import type { PaymentMethod } from '@prisma/client';

export type CreatePaymentInput = {
  washOrderId: number;
  amount: number;
  method: PaymentMethod;
};

export type UpdatePaymentInput = {
  amount?: number;
};
