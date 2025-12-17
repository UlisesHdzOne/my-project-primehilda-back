export type CreateServiceTypeInput = {
  name: string;
  basePrice: number;
  duration: number;
};

export type UpdateServiceTypeInput = Partial<CreateServiceTypeInput>;
