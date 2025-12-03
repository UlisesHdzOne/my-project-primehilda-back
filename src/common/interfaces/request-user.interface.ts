import type { Role } from '@prisma/client';

/**
 * Usuario en el request (payload del JWT)
 */
export type RequestUser = {
  id: number;
  phone: string;
  role: Role;
  iat?: number;
  exp?: number;
};
