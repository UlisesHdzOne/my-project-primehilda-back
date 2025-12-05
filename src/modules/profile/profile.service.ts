import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
import type {
  UserWithProfileResponse,
  UpdateCompleteProfileInput,
  ProfilePublicResponse,
} from './types/profile.types';

@Injectable()
export class ProfileService {
  private userCache = new Map<number, UserWithProfileResponse>();

  constructor(
    @Inject('PROFILE_REPOSITORY')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async getUserWithProfile(userId: number): Promise<UserWithProfileResponse> {
    if (this.userCache.has(userId)) return this.userCache.get(userId)!;

    const user = await this.profileRepository.findUserWithProfile(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    this.userCache.set(userId, user);
    return user;
  }

  async getPublicProfile(userId: number): Promise<ProfilePublicResponse | null> {
    const profile = await this.profileRepository.findProfileByUserId(userId);
    if (!profile) return null;
    return { id: profile.id, bio: profile.bio, avatarUrl: profile.avatarUrl };
  }

  async updateMyCompleteProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileResponse> {
    const updated = await this.profileRepository.updateUserWithProfile(userId, data);
    this.userCache.set(userId, updated);
    return updated;
  }

  async hasProfile(userId: number): Promise<boolean> {
    return this.profileRepository.profileExists(userId);
  }
}
