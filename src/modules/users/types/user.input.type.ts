import type { Role } from '@prisma/client';

/**
 * Tipos para entrada de datos en servicios
 */
export type CreateUserInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: boolean;
};

export type FindUsersInput = {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};
