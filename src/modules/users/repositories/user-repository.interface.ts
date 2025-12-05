import type {
  UserSafe,
  FindUsersInput,
  CountUsersParams,
  UserWithPasswordFromRepository,
  UserCreateInput,
} from '../types/user.types';

export interface IUserRepository {
  findByPhone(phone: string): Promise<UserSafe | null>;
  findById(id: number): Promise<UserSafe | null>;
  findMany(params: FindUsersInput): Promise<UserSafe[]>;

  count(params: CountUsersParams): Promise<number>;

  findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null>;

  create(data: UserCreateInput): Promise<UserSafe>;
}
