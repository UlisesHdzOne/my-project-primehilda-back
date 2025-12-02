import type { UserSafe } from '@/modules/users/types/user-safe.type';
import type { ProfilePublic } from './profile-safe.type';

/**
 * 🎯 TIPOS DE SALIDA/RESPUESTA
 * (Reemplazan a los DTOs de respuesta)
 */

// Opción 1: Perfil como propiedad directa
export type UserWithProfileOutput = UserSafe & {
  profile?: ProfilePublic; // Opcional
};

// Opción 2: Estructurado en user/profile
export type UserProfileStructuredOutput = {
  user: UserSafe;
  profile: ProfilePublic | null;
};

// Para listados
export type UserWithProfileBasicOutput = Pick<UserSafe, 'id' | 'name' | 'phone'> & {
  profile?: { avatarUrl: string | null };
};
