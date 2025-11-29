import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
//import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserWithProfileResponseDto } from './dto/user-with-profile-response.dto';
import { UpdateCompleteProfileDto } from './dto/update-complete-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: IProfileRepository,
  ) {}

  async getUserWithProfile(userId: number): Promise<UserWithProfileResponseDto> {
    const userWithProfile = await this.profileRepository.findUserWithProfile(userId);
    if (!userWithProfile) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }
    return userWithProfile;
  }

  async updateMyCompleteProfile(userId: number, data: UpdateCompleteProfileDto) {
    return this.profileRepository.updateUserWithProfile(userId, data);
  }

  // // ✅ADMIN
  // async getUserProfile(userId: number) {
  //   const profile = await this.profileRepository.findByUserId(userId);
  //   if (!profile) {
  //     throw new NotFoundException('Perfil de usuario no encontrado');
  //   }
  //   return profile;
  // }

  // async updateUserProfile(userId: number, data: UpdateProfileDto) {
  //   // Verificar que el usuario existe antes de actualizar
  //   const existingProfile = await this.profileRepository.findByUserId(userId);
  //   if (!existingProfile) {
  //     throw new NotFoundException('Usuario no encontrado');
  //   }

  //   return this.profileRepository.upsert(userId, data);
  // }
}
