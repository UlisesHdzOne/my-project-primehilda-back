import type { UserBase } from '@/common/types/base.types';

/**
 * ✅ UserSafe OPTIMIZADO con Pick
 * Define EXACTAMENTE qué campos devolvemos en respuestas públicas
 */
export type UserSafe = Pick<
  UserBase,
  'id' | 'name' | 'phone' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'
>;
// Resultado: { id, name, phone, role, isActive, createdAt, updatedAt }

/**
 * ✅ UserForList - mínimo para listados
 */
export type UserForList = Pick<UserBase, 'id' | 'name' | 'phone'>;
// Resultado: { id, name, phone }
