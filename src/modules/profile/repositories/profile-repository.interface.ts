import type { UserWithProfileResponseDto } from '../dto/user-with-profile-response.dto';
import type { UpdateCompleteProfileDto } from '../dto/update-complete-profile.dto';

export interface IProfileRepository {
  findUserWithProfile(userId: number): Promise<UserWithProfileResponseDto | null>;
  updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileDto,
  ): Promise<UserWithProfileResponseDto>;
}
