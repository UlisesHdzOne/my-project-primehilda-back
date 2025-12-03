// ============================================
// 📁 src/modules/users/types/user.types.ts
// ============================================
// ✨ ÚNICO archivo de types - Todo consolidado aquí

import type { User, Role } from '@prisma/client';

// ============================================
// 📦 ENTITY TYPES (desde Prisma)
// ============================================

/**
 * Usuario completo de Prisma (incluye password)
 * ⚠️ Solo usar en autenticación
 */
export type UserEntity = User;

// ============================================
// 🔒 SAFE TYPES (sin campos sensibles)
// ============================================

/**
 * Usuario seguro - SIN password
 * Este es el tipo base para retornar al cliente
 */
export type UserSafe = Omit<User, 'password'>;

/**
 * Usuario compacto para listas
 * Solo los campos esenciales
 */
export type UserListItem = Pick<User, 'id' | 'name' | 'phone'>;

// ============================================
// 📥 INPUT TYPES (parámetros de métodos)
// ============================================

/**
 * Datos para crear un usuario
 */
export type CreateUserInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: boolean;
};

/**
 * Datos para actualizar un usuario
 */
export type UpdateUserInput = {
  name?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
};

/**
 * Parámetros para buscar usuarios
 */
export type FindUsersInput = {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  orderBy?: keyof UserSafe;
  orderDirection?: 'asc' | 'desc';
};

// ============================================
// 📤 OUTPUT TYPES (retornos de métodos)
// ============================================

/**
 * Usuario estándar de salida
 * ℹ️ Es equivalente a UserSafe, pero el nombre es semántico
 */
export type UserOutput = UserSafe;

/**
 * Respuesta paginada de usuarios
 */
export type UsersListOutput = {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ============================================
// 🗄️ REPOSITORY TYPES
// ============================================

/**
 * Lo que devuelve el repositorio (sin password)
 * ℹ️ Coincide con UserSafe, pero indica origen del dato
 */
export type UserFromRepository = UserSafe;

/**
 * Usuario con password - Solo para autenticación
 * Lo que devuelve findByPhoneWithPassword()
 */
export type UserWithPasswordFromRepository = UserEntity;

/**
 * Parámetros para count de usuarios
 */
export type CountUsersParams = Pick<FindUsersInput, 'search' | 'role' | 'isActive'>;

// ============================================
// 🔗 RELATION TYPES (con relaciones)
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
// 🏷️ TYPE GUARDS
// ============================================

/**
 * Verifica si un usuario tiene password
 */
export function hasPassword(user: UserSafe | UserEntity): user is UserEntity {
  return 'password' in user && typeof user.password === 'string';
}

/**
 * Verifica si un usuario tiene perfil cargado
 */
export function hasProfile(user: UserSafe | UserWithProfile): user is UserWithProfile {
  return 'profile' in user;
}
