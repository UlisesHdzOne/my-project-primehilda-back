import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
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
}
//hay error en este servicio ya que hay que quitar los dto y usar types