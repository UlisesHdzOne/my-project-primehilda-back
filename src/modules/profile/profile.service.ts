// ============================================
// 📁 src/modules/profile/profile.service.ts
// ============================================

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

  /**
   * Obtener usuario con perfil
   * ✅ Sin conversión innecesaria, solo transforma estructura
   */
  async getUserWithProfile(userId: number): Promise<UserWithProfileOutput> {
    const user = await this.profileRepository.findUserWithProfile(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // ✅ Transformación VÁLIDA: cambiamos estructura (profile puede ser null)
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            id: user.profile.id,
            bio: user.profile.bio,
            avatarUrl: user.profile.avatarUrl,
          }
        : undefined, // ✅ Convertimos null → undefined
    };
  }

  /**
   * Obtener perfil público de un usuario
   * Para ver perfiles de otros usuarios
   */
  async getPublicProfile(userId: number): Promise<ProfilePublic | null> {
    const profile = await this.profileRepository.findProfileByUserId(userId);

    if (!profile) {
      return null;
    }

    // ✅ Transformación VÁLIDA: excluimos userId (campo sensible)
    return {
      id: profile.id,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    };
  }

  // ============================================
  // ✏️ ACTUALIZACIONES
  // ============================================

  /**
   * Actualizar perfil completo del usuario
   * Puede actualizar datos de User + UserProfile
   */
  async updateMyCompleteProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileOutput> {
    const updatedUser = await this.profileRepository.updateUserWithProfile(userId, data);

    // ✅ Transformación VÁLIDA: null → undefined
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      profile: updatedUser.profile
        ? {
            id: updatedUser.profile.id,
            bio: updatedUser.profile.bio,
            avatarUrl: updatedUser.profile.avatarUrl,
          }
        : undefined,
    };
  }

  /**
   * Verificar si un usuario tiene perfil creado
   */
  async hasProfile(userId: number): Promise<boolean> {
    return this.profileRepository.profileExists(userId);
  }
}
