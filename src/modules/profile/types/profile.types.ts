import type { UserSafe } from '../../users/types/user.types';

/**
 * Entidad cruda
 */
export type UserProfileEntity = {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
};

/**
 * Safe / Public Types
 */
export type ProfileSafe = UserProfileEntity;
export type ProfilePublic = Pick<UserProfileEntity, 'id' | 'bio' | 'avatarUrl'>;

/**
 * Input Types
 */
export type UpdateCompleteProfileInput = {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export type CreateProfileInput = { userId: number; bio?: string | null; avatarUrl?: string | null };

/**
 * Output Types
 */
export type ProfileOutput = ProfilePublic;
export type UserWithProfileOutput = UserSafe & { profile?: ProfileSafe | null };

/**
 * Repository
 */
export type ProfileFromRepository = UserProfileEntity;

/**
 * Type Guards
 */
export function hasProfile(user: UserWithProfileOutput): boolean {
  return !!user.profile;
}

export function hasProfileData(data: UpdateCompleteProfileInput): boolean {
  return data.bio !== undefined || data.avatarUrl !== undefined;
}
