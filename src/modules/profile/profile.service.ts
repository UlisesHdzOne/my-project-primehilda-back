import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
import type {
  UserWithProfileOutput,
  UpdateCompleteProfileInput,
  ProfilePublic,
} from './types/profile.types';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async getUserWithProfile(userId: number): Promise<UserWithProfileOutput> {
    const user = await this.profileRepository.findUserWithProfile(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async getPublicProfile(userId: number): Promise<ProfilePublic | null> {
    const profile = await this.profileRepository.findProfileByUserId(userId);
    if (!profile) return null;

    return { id: profile.id, bio: profile.bio, avatarUrl: profile.avatarUrl };
  }

  async updateMyCompleteProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileOutput> {
    return this.profileRepository.updateUserWithProfile(userId, data);
  }

  async hasProfile(userId: number): Promise<boolean> {
    return this.profileRepository.profileExists(userId);
  }
}
