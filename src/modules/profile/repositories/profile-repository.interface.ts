import type {
  UserWithProfileResponse,
  UpdateCompleteProfileInput,
  ProfileFromRepository,
  CreateProfileInput,
} from '../types/profile.types';

export interface IProfileRepository {
  findUserWithProfile(userId: number): Promise<UserWithProfileResponse | null>;
  findProfileByUserId(userId: number): Promise<ProfileFromRepository | null>;
  updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileResponse>;
  createProfile(data: CreateProfileInput): Promise<ProfileFromRepository>;
  profileExists(userId: number): Promise<boolean>;
}
