import type { User, Role } from '@prisma/client';
import type { UserSafe } from '../types/user-safe.type';

export interface IUserRepository {
  // ✅ NUEVO - Para LOGIN (necesita password)
  findByPhoneWithPassword(phone: string): Promise<User | null>;

  // ✅ MODIFICADO - Para MOSTRAR usuario (sin password)
  findByPhone(phone: string): Promise<UserSafe | null>;
  findById(id: number): Promise<UserSafe | null>;
  create(userData: CreateUserData): Promise<UserSafe>;
  findMany(params: FindManyParams): Promise<UserSafe[]>;
}

export interface CreateUserData {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: boolean;
}

export interface FindManyParams {
  skip: number;
  take: number;
  search?: string;
  isActive?: boolean;
  role?: Role;
  //orderBy?: keyof User;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
