import type {
  UpdatedUserWithProfile,
  UpdateProfileData,
  UserWithProfileFromRepo,
} from '../types/profile-safe.type';

export interface IProfileRepository {
  findUserWithProfile(userId: number): Promise<UserWithProfileFromRepo | null>;
  updateUserWithProfile(userId: number, data: UpdateProfileData): Promise<UpdatedUserWithProfile>;
}
