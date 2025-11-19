import { Expose } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  title: string;

  @Expose()
  address: string;

  @Expose()
  city: string;

  @Expose()
  state: string;

  @Expose()
  zipCode: string;

  @Expose()
  country: string;

  @Expose()
  notes?: string | null;

  @Expose()
  isDefault: boolean;

  @Expose()
  latitude?: number | null;

  @Expose()
  longitude?: number | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AddressResponseDto>) {
    Object.assign(this, partial);
  }
}
