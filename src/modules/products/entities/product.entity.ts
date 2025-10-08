export class ProductEntity {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  freeOptions?: { category: string; quantity: number }[];

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
