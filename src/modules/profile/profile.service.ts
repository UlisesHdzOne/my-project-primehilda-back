import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProfileRepository } from './repositories/profile-repository.interface';
import type {
  UserWithProfileOutput,
  UpdateCompleteProfileInput,
  ProfilePublic,
} from './types/profile.types';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: IProfileRepository,
  ) {}

  // ============================================
  // 🔍 CONSULTAS
  // ============================================

  async getUserWithProfile(userId: number): Promise<UserWithProfileOutput> {
    const user = await this.profileRepository.findUserWithProfile(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user; // ✅ Nada que transformar
  }

  async getPublicProfile(userId: number): Promise<ProfilePublic | null> {
    const profile = await this.profileRepository.findProfileByUserId(userId);

    if (!profile) return null;

    return {
      id: profile.id,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    };
  }

  // ============================================
  // ✏️ ACTUALIZACIONES
  // ============================================

  async updateMyCompleteProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileOutput> {
    const updatedUser = await this.profileRepository.updateUserWithProfile(userId, data);

    return updatedUser; // ✅ Ya viene en el formato correcto
  }

  async hasProfile(userId: number): Promise<boolean> {
    return this.profileRepository.profileExists(userId);
  }
}
