import { Address } from '@prisma/client';

export class AddressEntity {
  id: number;
  userId: number;
  name: string | null;
  street: string;
  colony: string;
  reference: string | null;
  zipcode: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(address: Address) {
    this.id = address.id;
    this.userId = address.userId;
    this.name = address.name;
    this.street = address.street;
    this.colony = address.colony;
    this.reference = address.reference;
    this.zipcode = address.zipcode;
    this.latitude = address.latitude;
    this.longitude = address.longitude;
    this.isDefault = address.isDefault;
    this.createdAt = address.createdAt;
    this.updatedAt = address.updatedAt;
  }
}
