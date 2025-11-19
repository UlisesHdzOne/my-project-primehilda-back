import { Expose } from 'class-transformer';

export class ProductPublicDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  description?: string | null;

  @Expose()
  price!: number;

  @Expose()
  imageUrl?: string | null;

  @Expose()
  category!: string;

  @Expose()
  hasGifts!: boolean;

  constructor(partial: Partial<ProductPublicDto>) {
    Object.assign(this, partial);
  }
}
