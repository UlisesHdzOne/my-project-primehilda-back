import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
import { IUserRepository } from '../users/repositories/user-repository.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: IProfileRepository,
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async getMyProfile(userId: number) {
    // verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.profileRepository.findByUserId(userId);
  }

  async updateMyProfile(userId: number, data: UpdateProfileDto) {
    // verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.profileRepository.upsert(userId, data);
  }
}
