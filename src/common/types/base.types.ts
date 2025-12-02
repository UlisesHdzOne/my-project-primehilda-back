import type { Role } from '@prisma/client';

/**
 * 🏗️ INTERFAZ BASE DE USER
 * Representa todos los campos que Prisma devuelve para User
 * Esta es nuestra "fuente de verdad"
 */
export interface UserBase {
  id: number;
  name: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 🏗️ INTERFAZ BASE DE USER_PROFILE
 * Representa todos los campos que Prisma devuelve para UserProfile
 */
export interface UserProfileBase {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
}

/**
 * 🏗️ TIPOS COMUNES DERIVADOS (para reuso)
 */
export type UserIdentifier = Pick<UserBase, 'id' | 'phone'>;
export type UserBasicInfo = Pick<UserBase, 'id' | 'name' | 'phone'>;
export type UserStatus = Pick<UserBase, 'isActive' | 'role'>;
