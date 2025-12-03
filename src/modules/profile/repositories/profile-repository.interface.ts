// ============================================
// 📁 src/modules/profile/repositories/profile-repository.interface.ts
// ============================================

import type {
  UserWithProfileFromRepository,
  UpdateCompleteProfileInput,
  ProfileFromRepository,
  CreateProfileInput,
} from '../types/profile.types';

/**
 * Contrato del repositorio de perfiles
 */
export interface IProfileRepository {
  // Búsquedas
  findUserWithProfile(userId: number): Promise<UserWithProfileFromRepository | null>;
  findProfileByUserId(userId: number): Promise<ProfileFromRepository | null>;

  // Mutaciones
  updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileFromRepository>;

  createProfile(data: CreateProfileInput): Promise<ProfileFromRepository>;

  // Útiles
  profileExists(userId: number): Promise<boolean>;
}
