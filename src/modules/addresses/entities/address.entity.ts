export class AddressEntity {
  id!: number;
  userId!: number;
  title!: string;
  address!: string;
  city!: string;
  state!: string;
  zipCode!: string;
  country!: string;
  notes?: string | null;
  isDefault!: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<AddressEntity>) {
    Object.assign(this, partial);
  }
}
