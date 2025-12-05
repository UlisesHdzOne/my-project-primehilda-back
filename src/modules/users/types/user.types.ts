import type { Role } from '@prisma/client';

// Tipo completo para detalle
export interface UserResponse {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo optimizado para listados
export type UserListResponse = Omit<UserResponse, 'createdAt' | 'updatedAt'>;

// Tipo con password
export interface UserWithPasswordFromRepository extends UserResponse {
  password: string;
}

// Inputs
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

// Outputs
export interface UsersListOutput {
  users: UserListResponse[];
  total: number;
  page: number;
  pageSize: number;
}
