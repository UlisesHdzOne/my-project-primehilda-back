import type { CreateUserInput, FindUsersInput } from '../types/user.input.type';
import type { UserFromRepo, UserWithPasswordFromRepo } from '../types/user.repo.type';

export interface IUserRepository {
  // Para autenticación (con password)
  findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepo | null>;

  // Para mostrar usuarios (sin password)
  findByPhone(phone: string): Promise<UserFromRepo | null>;
  findById(id: number): Promise<UserFromRepo | null>;
  create(userData: CreateUserInput): Promise<UserFromRepo>;
  findMany(params: FindUsersInput): Promise<UserFromRepo[]>;
}
