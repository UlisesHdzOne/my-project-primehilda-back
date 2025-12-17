import type { OrderStatus } from '@prisma/client';

export type CreateWashOrderInput = {
  carId: number;
  employeeId: number;
  status?: OrderStatus;
  services?: { serviceTypeId: number }[];
};

export type UpdateWashOrderInput = {
  status?: OrderStatus;
};
