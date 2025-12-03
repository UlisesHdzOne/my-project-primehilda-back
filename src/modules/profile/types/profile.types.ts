// ============================================
// 📁 src/modules/profile/types/profile.types.ts
// ============================================
// ✨ ÚNICO archivo de types - Todo consolidado aquí

import type { Role } from '@prisma/client';

// ============================================
// 📦 BASE TYPES (desde Prisma)
// ============================================

/**
 * Perfil de usuario completo de Prisma
 */
export type UserProfileEntity = {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
};

// ============================================
// 🔒 SAFE TYPES (sin campos sensibles)
// ============================================

/**
 * Perfil seguro - sin campos sensibles
 */
export type ProfileSafe = {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
};

/**
 * Perfil público - sin userId
 * Para mostrar en perfiles de otros usuarios
 */
export type ProfilePublic = {
  id: number;
  bio: string | null;
  avatarUrl: string | null;
};

// ============================================
// 📥 INPUT TYPES (parámetros de métodos)
// ============================================

/**
 * Datos para crear/actualizar perfil completo
 * Incluye datos de User + UserProfile
 */
export type UpdateCompleteProfileInput = {
  // Campos de User (opcionales)
  name?: string;

  // Campos de UserProfile (opcionales)
  bio?: string | null;
  avatarUrl?: string | null;
};

/**
 * Datos para crear perfil de usuario
 */
export type CreateProfileInput = {
  userId: number;
  bio?: string | null;
  avatarUrl?: string | null;
};

// ============================================
// 📤 OUTPUT TYPES (retornos de métodos)
// ============================================

/**
 * Usuario con perfil incluido
 * Lo que devuelve el servicio
 */
export type UserWithProfileOutput = {
  // Datos de User
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Perfil (opcional porque puede no existir)
  profile?: ProfilePublic;
};

/**
 * Solo el perfil
 */
export type ProfileOutput = ProfilePublic;

// ============================================
// 🗄️ REPOSITORY TYPES
// ============================================

/**
 * Usuario con perfil desde Prisma
 * Lo que devuelve el repositorio
 */
export type UserWithProfileFromRepository = {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: number;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
};

/**
 * Perfil desde Prisma
 */
export type ProfileFromRepository = {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
};

// ============================================
// 🏷️ TYPE GUARDS
// ============================================

/**
 * Verifica si un usuario tiene perfil cargado
 */
export function hasProfile(
  user: UserWithProfileOutput | UserWithProfileFromRepository,
): user is UserWithProfileOutput & { profile: ProfilePublic } {
  return user.profile !== null && user.profile !== undefined;
}

/**
 * Verifica si hay datos de perfil para actualizar
 */
export function hasProfileData(data: UpdateCompleteProfileInput): boolean {
  return data.bio !== undefined || data.avatarUrl !== undefined;
}
