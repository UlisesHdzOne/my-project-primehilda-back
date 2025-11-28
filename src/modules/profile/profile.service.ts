import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from './repositories/profile-repository.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: IProfileRepository,
  ) {}

  async getMyProfile(userId: number) {
    return this.profileRepository.findByUserId(userId);
  }

  async updateMyProfile(userId: number, data: UpdateProfileDto) {
    return this.profileRepository.upsert(userId, data);
  }
}
