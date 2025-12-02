import type { UserBase } from '../types/base.types';

/**
 * ✅ OPTIMIZADO con Pick
 * Payload del JWT - solo lo necesario para autenticación
 */
export type RequestUser = Pick<UserBase, 'id' | 'phone' | 'role'> & {
  iat?: number; // JWT issued at
  exp?: number; // JWT expiration
};
