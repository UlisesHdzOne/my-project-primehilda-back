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

export type ProfilePublic = Pick<UserProfileEntity, 'id' | 'bio' | 'avatarUrl'>;

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
export type UserWithProfileOutput = UserSafe & { profile?: UserProfileEntity | null };
export type ProfileOutput = ProfilePublic;

// ======================
// 🏗️ REPOSITORY
// ======================
export type ProfileFromRepository = UserProfileEntity;

// ======================
// ⚡ TYPE GUARDS
// ======================
export function hasProfile(user: UserWithProfileOutput): boolean {
  return !!user.profile;
}

export function hasProfileData(data: UpdateCompleteProfileInput): boolean {
  return data.bio !== undefined || data.avatarUrl !== undefined;
}
