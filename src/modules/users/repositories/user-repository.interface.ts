import type {
  CreateUserInput,
  FindUsersInput,
  UserFromRepository,
  UserWithPasswordFromRepository,
  CountUsersParams,
} from '../types/user.types';

/**
 * Contrato del repositorio de usuarios
 */
export interface IUserRepository {
  // Búsquedas sin password
  findByPhone(phone: string): Promise<UserFromRepository | null>;
  findById(id: number): Promise<UserFromRepository | null>;
  findMany(params: FindUsersInput): Promise<UserFromRepository[]>;

  // Conteo
  count(params: CountUsersParams): Promise<number>;

  // Búsqueda con password (solo auth)
  findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null>;

  // Mutaciones
  create(userData: CreateUserInput): Promise<UserFromRepository>;

  // Actualizaciones (si las necesitas)
  // update(id: number, data: UpdateUserInput): Promise<UserFromRepository>;
  // delete(id: number): Promise<void>;
}
