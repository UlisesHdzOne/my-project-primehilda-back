export class ProductEntity {
  id!: number;
  name!: string;
  description?: string | null;
  price!: number;
  imageUrl?: string | null;
  category!: string;
  isActive!: boolean;
  hasGifts!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
