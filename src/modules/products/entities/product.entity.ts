import { Product } from '@prisma/client';

interface FreeOptionPrisma {
  id: number;
  category: string;
  quantity: number;
  orderType: string;
}

interface ProductPayload {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  freeOptions: FreeOptionPrisma[];
}

export class ProductEntity {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly category: string;
  readonly image?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly freeOptions?: FreeOptionPrisma[];

  constructor(
    product: Partial<Product> & { freeOptions?: FreeOptionPrisma[] },
  ) {
    Object.assign(this, product);
    this.description = product.description ?? undefined;
    this.image = product.image ?? undefined;
    this.isActive = product.isActive ?? true;
    this.freeOptions = product.freeOptions ?? [];
  }

  static fromPrisma(
    product: Product & { freeOptions?: FreeOptionPrisma[] },
  ): ProductEntity {
    return new ProductEntity(product);
  }
}
