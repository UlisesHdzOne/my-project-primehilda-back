import type { User, Role } from '@prisma/client';
import type { UserSafe } from './types/user-safe.type';

export interface IUserRepository {
  findByPhone(phone: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
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
  orderBy?: keyof User;
  orderDirection?: 'asc' | 'desc';
}
