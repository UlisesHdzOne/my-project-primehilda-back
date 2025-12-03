import type { Role } from '@prisma/client';

/**
 * Tipos base compartidos del módulo auth
 */
export type AuthPayload = {
  id: number;
  phone: string;
  role: Role;
  iat?: number;
  exp?: number;
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};
