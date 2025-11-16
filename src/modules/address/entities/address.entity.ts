import { Address } from '@prisma/client';

export class AddressEntity {
  id: number;
  userId: number;
  name?: string;
  street: string;
  colony: string;
  reference?: string;
  zipcode?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }

  static fromPrisma(address: Address): AddressEntity {
    return new AddressEntity(address);
  }
}
