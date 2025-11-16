import { UserEntity } from '../entities/user.entity';

export interface UserEntityResponse {
  data: UserEntity[];
  total: number;
  page: number;
  limit: number;
}
