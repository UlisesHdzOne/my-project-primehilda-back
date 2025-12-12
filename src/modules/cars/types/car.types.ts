export type CreateCarInput = {
  plate: string;
  brand: string;
  model: string;
  color: string;
};

export type UpdateCarInput = Partial<CreateCarInput>;
