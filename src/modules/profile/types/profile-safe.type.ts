// modules/profile/types/profile.types.ts
import type { UserBase, UserProfileBase } from '@/common/types/base.types';
import type { UserSafe } from '@/modules/users/types/user-safe.type';
import type { Role } from '@prisma/client';

// ============ TIPOS BASE ============
/**
 * Profile con todos los campos (incluye userId)
 */
export type ProfileSafe = Pick<UserProfileBase, 'id' | 'userId' | 'bio' | 'avatarUrl'>;
// Resultado: { id, userId, bio, avatarUrl }

/**
 * Profile para respuestas públicas (sin userId)
 */
export type ProfilePublic = Pick<UserProfileBase, 'id' | 'bio' | 'avatarUrl'>;
// Resultado: { id, bio, avatarUrl }

// ============ TIPOS COMBINADOS ============
/**
 * Usuario con su perfil (para respuestas detalladas)
 */
export type UserWithProfile = UserSafe & {
  profile?: ProfilePublic;
};

/**
 * Respuesta estructurada de usuario con perfil
 */
export type UserProfileResponse = {
  user: UserSafe;
  profile: ProfilePublic | null;
};

/**
 * Para listados con información básica
 */
export type UserWithProfileBasic = Pick<UserBase, 'id' | 'name' | 'phone'> & {
  profile?: Pick<UserProfileBase, 'avatarUrl'>;
};

// ============ TIPOS PARA OPERACIONES ============
/**
 * Datos para crear un nuevo perfil
 */
export type CreateProfileData = Omit<UserProfileBase, 'id'>;
// Resultado: { userId, bio, avatarUrl }

/**
 * Datos para actualizar perfil (parcial)
 */
export type UpdateProfileData = {
  // Campos del perfil
  bio?: string | null;
  avatarUrl?: string | null;
  // Campos del usuario
  name?: string;
};

// ============ TIPOS PARA REPOSITORIO ============
/**
 * Tipo que devuelve el repositorio al buscar usuario con perfil
 */
export type UserWithProfileFromRepo = {
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

// ============ TIPOS PARA SERVICIO ============

/**
 * Tipo para datos de actualización en el servicio
 */
export type UpdateProfileServiceData = {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

/**
 * Tipo para respuesta del repositorio de update
 */
export type UpdatedUserWithProfile = UserWithProfileFromRepo;
