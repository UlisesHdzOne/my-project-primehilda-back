import { AddressEntity } from './address.entity';

export interface AddressEntityResponse {
  addresses: AddressEntity[];
  total: number;
  page: number;
  limit: number;
}
