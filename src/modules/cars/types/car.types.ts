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
  orders?: Array<{
    id: number;
    date: Date;
    totalPrice: number;
    status: string;
  }>;
};
