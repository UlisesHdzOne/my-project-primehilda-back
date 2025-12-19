import type { PaymentMethod } from '@prisma/client';

export type CreatePaymentInput = {
  washOrderId: number;
  amount: number;
  method: PaymentMethod;
};

//checar si no se elimina o ya no se va a usar
export type UpdatePaymentInput = {
  amount?: number;
};

export type PaymentWithOrder = {
  id: number;
  date: Date;
  amount: number;
  method: PaymentMethod;
  orderId: number;
  order?: {
    id: number;
    totalPrice: number;
    status: string;
  };
};

// NUEVO: Type para respuesta de pagos por orden
export type OrderPaymentsSummary = {
  orderId: number;
  orderTotal: number;
  totalPaid: number;
  remaining: number;
  payments: PaymentWithOrder[];
};