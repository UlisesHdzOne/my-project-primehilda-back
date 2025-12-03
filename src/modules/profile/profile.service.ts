import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
import { UpdateProfileInput } from './types/profile.input.type';
import { UserWithProfileOutput } from './types/profile.output.type';
import { UserWithProfileFromRepo } from './types/profile.repo.type';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: IProfileRepository,
  ) {}

  private toUserWithProfileOutput(data: UserWithProfileFromRepo): UserWithProfileOutput {
    const { profile, ...userData } = data;

    return {
      ...userData,
      profile: profile
        ? {
            id: profile.id,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
          }
        : undefined,
    };
  }

  async getUserWithProfile(userId: number): Promise<UserWithProfileOutput> {
    const userWithProfile = await this.profileRepository.findUserWithProfile(userId);

    if (!userWithProfile) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    return this.toUserWithProfileOutput(userWithProfile);
  }

  async updateMyCompleteProfile(
    userId: number,
    data: UpdateProfileInput,
  ): Promise<UserWithProfileOutput> {
    const updatedUser = await this.profileRepository.updateUserWithProfile(userId, data);
    return this.toUserWithProfileOutput(updatedUser);
  }
}
