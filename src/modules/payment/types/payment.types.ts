// src/modules/payment/types/payment.types.ts
import type { PaymentMethod } from '@/common/enums';

export type CreatePaymentInput = {
  washOrderId: number;
  amount: number;
  method: PaymentMethod;
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

export type OrderPaymentsSummary = {
  orderId: number;
  orderTotal: number;
  totalPaid: number;
  remaining: number;
  payments: PaymentWithOrder[];
};

// ✅ Nuevo tipo para pagos con detalles extendidos
export type PaymentWithDetails = PaymentWithOrder & {
  order?: {
    id: number;
    totalPrice: number;
    status: string;
    car?: {
      plate: string;
      brand: string;
    };
    employee?: {
      name: string;
    };
  };
};
