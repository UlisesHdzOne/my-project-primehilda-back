import type {
  UserSafe,
  FindUsersInput,
  CountUsersParams,
  UserWithPasswordFromRepository,
  UserCreateInput,
} from '../types/user.types';

export interface IUserRepository {
  // Búsquedas
  findByPhone(phone: string): Promise<UserSafe | null>;
  findById(id: number): Promise<UserSafe | null>;
  findMany(params: FindUsersInput): Promise<UserSafe[]>;

  // Conteo
  count(params: CountUsersParams): Promise<number>;

  // Autenticación
  findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null>;

  // Creación
  create(userData: UserCreateInput): Promise<UserSafe>;
}
