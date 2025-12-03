import type { UserBase } from '@/common/types/base.types';

/**
 * Tipos base reutilizables del módulo users
 */
export type UserSafe = Pick<
  UserBase,
  'id' | 'name' | 'phone' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export type UserForList = Pick<UserBase, 'id' | 'name' | 'phone'>;
export type UserWithPassword = UserBase; // Para autenticación (incluye password)
