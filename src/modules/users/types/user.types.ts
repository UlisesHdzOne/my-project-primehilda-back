// ============================================
// 📁 src/modules/users/types/user.types.ts
// ============================================

import type { User, Role } from '@prisma/client';

// ============================================
// 📦 ENTITY TYPES (datos crudos desde Prisma)
// ============================================

/**
 * Usuario completo desde Prisma (incluye password)
 */
export type UserEntity = User;

// ============================================
// 🔒 SAFE TYPES (sin password)
// ============================================

/**
 * Usuario seguro para enviar al cliente
 */
export type UserSafe = Omit<UserEntity, 'password'>;

/**
 * Usuario compacto para listas
 */
export type UserListItem = Pick<UserSafe, 'id' | 'name' | 'phone'>;

// ============================================
// 📥 INPUT TYPES
// ============================================

export type CreateUserInput = {
  name: string;
  phone: string;

  // 🔐 Ahora opcional: permite crear contraseña automática
  password: string;

  role?: Role;
  isActive?: boolean;
};

export type UpdateUserInput = {
  name?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
};

export type FindUsersInput = {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;

  // 🔧 Ordenamiento seguro — solo campos de UserSafe
  orderBy?: keyof UserSafe;
  orderDirection?: 'asc' | 'desc';
};

// ============================================
// 📤 OUTPUT TYPES
// ============================================

export type UserOutput = UserSafe;

export type UsersListOutput = {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ============================================
// 🔗 RELATION TYPES
// ============================================

/**
 * Usuario con perfil incluido
 */
export type UserWithProfile = UserSafe & {
  profile: {
    id: number;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
};

// ============================================
// 🗄️ REPOSITORY TYPES
// ============================================

/**
 * Usuario desde repositorio sin password
 */
export type UserFromRepository = UserSafe;

/**
 * Usuario desde repositorio CON password
 * (solo para login y auth)
 */
export type UserWithPasswordFromRepository = UserEntity;

/**
 * Parámetros para "count"
 */
export type CountUsersParams = Pick<FindUsersInput, 'search' | 'role' | 'isActive'>;

// ============================================
// 🏷️ TYPE GUARDS
// ============================================

export function hasPassword(user: UserSafe | UserEntity): user is UserEntity {
  return 'password' in user;
}
