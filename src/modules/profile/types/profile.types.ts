// ============================================
// 📁 src/modules/profile/types/profile.types.ts
// ============================================

import type { UserWithProfile } from '../../users/types/user.types';

// ============================================
// 📦 ENTITY TYPES (datos crudos)
// ============================================

export type UserProfileEntity = {
  id: number;
  userId: number;
  bio: string | null;
  avatarUrl: string | null;
};

// ============================================
// 🔒 SAFE TYPES
// ============================================

export type ProfileSafe = UserProfileEntity;

export type ProfilePublic = {
  id: number;
  bio: string | null;
  avatarUrl: string | null;
};

// ============================================
// 📥 INPUT TYPES
// ============================================

export type UpdateCompleteProfileInput = {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export type CreateProfileInput = {
  userId: number;
  bio?: string | null;
  avatarUrl?: string | null;
};

// ============================================
// 📤 OUTPUT TYPES
// ============================================

export type ProfileOutput = ProfilePublic;

export type UserWithProfileOutput = UserWithProfile;

// ============================================
// 🗄️ REPOSITORY TYPES
// ============================================

export type ProfileFromRepository = UserProfileEntity;

// ============================================
// 🏷️ TYPE GUARDS
// ============================================

export function hasProfile(user: UserWithProfileOutput): boolean {
  return !!user.profile;
}

export function hasProfileData(data: UpdateCompleteProfileInput): boolean {
  return data.bio !== undefined || data.avatarUrl !== undefined;
}
