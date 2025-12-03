// ============================================
// 📁 src/modules/profile/repositories/profile-repository.interface.ts
// ============================================

import type {
  UserWithProfileOutput,
  UpdateCompleteProfileInput,
  ProfileFromRepository,
  CreateProfileInput,
} from '../types/profile.types';

/**
 * Contrato del repositorio de perfiles
 */
export interface IProfileRepository {
  // Búsquedas
  findUserWithProfile(userId: number): Promise<UserWithProfileOutput | null>;
  findProfileByUserId(userId: number): Promise<ProfileFromRepository | null>;

  // Mutaciones
  updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileOutput>;

  createProfile(data: CreateProfileInput): Promise<ProfileFromRepository>;

  // Útiles
  profileExists(userId: number): Promise<boolean>;
}
