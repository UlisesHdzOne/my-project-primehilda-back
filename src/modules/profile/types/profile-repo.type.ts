import type { UserSafe } from '@/modules/users/types/user-safe.type';
import type { Role } from '@prisma/client';

/**
 * 🎯 TIPOS ESPECÍFICOS PARA REPOSITORIO
 * Tipos que coinciden exactamente con lo que devuelve Prisma
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

// Usando intersección para reutilizar
export type UserWithProfileRepo = UserSafe & {
  profile: {
    id: number;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
};

export type ProfileFromRepo = {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
};
