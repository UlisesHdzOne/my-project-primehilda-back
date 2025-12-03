import type { Role } from '@prisma/client';

/**
 * Tipos para entrada de datos en servicios auth
 */
export type LoginInput = {
  phone: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
};

export type RefreshTokenInput = {
  refresh_token: string;
};

export type ValidateTokenInput = {
  token: string;
};
