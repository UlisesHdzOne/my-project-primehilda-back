// src/shared/types/wash-order-response.types.ts - MEJORADO
import type { OrderStatus, PaymentMethod } from '@/common/enums';
import type { Prisma } from '@prisma/client';

// Tipo base para conversión segura
type PrismaWashOrder = Prisma.WashOrderGetPayload<{
  include: {
    car: true;
    employee: true;
    services: { include: { service: true } };
    payments: true;
  };
}>;

export type BaseWashOrderResponse = {
  id: number;
  date: Date;
  totalPrice: number;
  status: OrderStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  deliveredAt?: Date | null;
  carId: number;
  employeeId: number;
};

export type WashOrderWithCarResponse = BaseWashOrderResponse & {
  car: {
    id: number;
    plate: string;
    brand: string;
    model: string;
    color: string;
  };
  employee: {
    id: number;
    name: string;
  };
  services: Array<{
    id: number;
    service: {
      id: number;
      name: string;
      basePrice: number;
      duration: number;
    };
  }>;
  payments: Array<{
    id: number;
    date: Date;
    amount: number;
    method: PaymentMethod;
  }>;
};

// ✅ FUNCIÓN DE CONVERSIÓN SEGURA SIN `any`
export function toWashOrderWithCarResponse(order: PrismaWashOrder): WashOrderWithCarResponse {
  return {
    id: order.id,
    date: order.date,
    totalPrice: order.totalPrice,
    status: order.status as OrderStatus, // Esto es seguro porque sabemos que es OrderStatus
    startedAt: order.startedAt,
    completedAt: order.completedAt,
    deliveredAt: order.deliveredAt,
    carId: order.carId,
    employeeId: order.employeeId,
    car: order.car,
    employee: order.employee,
    services: order.services.map(service => ({
      id: service.id,
      service: service.service,
    })),
    payments: order.payments.map(payment => ({
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      method: payment.method as PaymentMethod, // Seguro porque sabemos que es PaymentMethod
    })),
  };
}
