import { Expose } from 'class-transformer';

export class ProductResponseDto {
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
  isActive!: boolean;

  @Expose()
  hasGifts!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}
