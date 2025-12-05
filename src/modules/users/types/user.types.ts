import type { Role } from '@prisma/client';

export interface UserSafe {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPasswordFromRepository {
  id: number;
  name: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindUsersInput {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;

  orderBy?: 'id' | 'name' | 'phone' | 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
}

export interface CountUsersParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserCreateInput {
  name: string;
  phone: string;
  password: string;
  role: Role;
}

export interface CreateUserByAdminInput {
  name: string;
  phone: string;
  password?: string;
  role?: Role;
}

export interface CreateUserPublicInput {
  name: string;
  phone: string;
  password: string;
}

export interface UsersListOutput {
  users: Array<Pick<UserSafe, 'id' | 'name' | 'phone'>>;
  total: number;
  page: number;
  pageSize: number;
}
