import type { OrderStatus } from '@/common/enums';

export type CreateWashOrderInput = {
  carId: number;
  employeeId: number;
  status?: OrderStatus;
  services: { serviceTypeId: number }[];
};

export type UpdateWashOrderInput = {
  status?: OrderStatus;
};

// NUEVO: Type para respuesta completa
export type WashOrderWithRelations = {
  id: number;
  date: Date;
  totalPrice: number;
  status: OrderStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  deliveredAt?: Date | null;
  carId: number;
  employeeId: number;

  // Relaciones (opcionales según necesidad)
  car?: {
    id: number;
    plate: string;
    brand: string;
    model: string;
    color: string;
  };

  employee?: {
    id: number;
    name: string;
  };

  services?: Array<{
    id: number;
    service: {
      id: number;
      name: string;
      basePrice: number;
      duration: number;
    };
  }>;

  payments?: Array<{
    id: number;
    date: Date;
    amount: number;
    method: string;
  }>;
};
