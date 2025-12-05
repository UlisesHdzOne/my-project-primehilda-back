import type { User } from '@prisma/client';

// ======================
// 🟢 ENTIDADES / SAFES
// ======================
export type UserSafe = Omit<User, 'password'>;

export interface UserProfileEntity {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
}

// Tipo público (para listas o público)
export type ProfilePublicResponse = Pick<UserProfileEntity, 'id' | 'bio' | 'avatarUrl'>;

// ======================
// 🟡 INPUTS
// ======================
export interface UpdateCompleteProfileInput {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface CreateProfileInput {
  userId: number;
  bio?: string | null;
  avatarUrl?: string | null;
}

// ======================
// 🔵 OUTPUTS
// ======================
export type UserWithProfileResponse = UserSafe & { profile?: UserProfileEntity | null };

// Tipo optimizado para listados (sin timestamps)
export type UserListWithProfileResponse = Omit<UserSafe, 'createdAt' | 'updatedAt'> & {
  profile?: ProfilePublicResponse | null;
};

// ======================
// 🏗️ REPOSITORY
// ======================
export type ProfileFromRepository = UserProfileEntity;

// ======================
// ⚡ TYPE GUARDS
// ======================
export function hasProfile(user: UserWithProfileResponse): boolean {
  return !!user.profile;
}

export function hasProfileData(data: UpdateCompleteProfileInput): boolean {
  return data.bio !== undefined || data.avatarUrl !== undefined;
}
