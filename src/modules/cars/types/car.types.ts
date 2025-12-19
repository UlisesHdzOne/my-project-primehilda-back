export type CreateCarInput = {
  plate: string;
  brand: string;
  model: string;
  color: string;
};

export type UpdateCarInput = Partial<CreateCarInput>;

export type CarWithOrders = {
  id: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
  createdAt: Date;
  detail?: {
    id: number;
    notes?: string;
  };
  orders?: Array<{
    id: number;
    date: Date;
    totalPrice: number;
    status: string;
    startedAt?: Date | null;
    completedAt?: Date | null;
    deliveredAt?: Date | null;
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
      method: string;
    }>;
  }>;
};
