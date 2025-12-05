import type {
  UserResponse,
  UserListResponse,
  FindUsersInput,
  CountUsersParams,
  UserWithPasswordFromRepository,
  UserCreateInput,
} from '../types/user.types';

export interface IUserRepository {
  findByPhone(phone: string): Promise<UserResponse | null>;
  findById(id: number): Promise<UserResponse | null>;
  findMany(params: FindUsersInput): Promise<UserListResponse[]>;
  count(params: CountUsersParams): Promise<number>;
  findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null>;
  create(data: UserCreateInput): Promise<UserResponse>;
}
