import type {
  UserWithProfileOutput,
  UpdateCompleteProfileInput,
  ProfileFromRepository,
  CreateProfileInput,
} from '../types/profile.types';

export interface IProfileRepository {
  findUserWithProfile(userId: number): Promise<UserWithProfileOutput | null>;
  findProfileByUserId(userId: number): Promise<ProfileFromRepository | null>;
  updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileOutput>;
  createProfile(data: CreateProfileInput): Promise<ProfileFromRepository>;
  profileExists(userId: number): Promise<boolean>;
}
