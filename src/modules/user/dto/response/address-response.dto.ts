export class AddressResponseDto {
  id: number;
  name?: string; // opcional
  street: string;
  colony: string;
  reference?: string; // opcional
  zipcode?: string; // opcional
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
