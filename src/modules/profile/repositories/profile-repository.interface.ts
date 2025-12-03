import type { UpdateProfileInput } from '../types/profile.input.type';
import type { UserWithProfileFromRepo } from '../types/profile.repo.type';

export interface IProfileRepository {
  findUserWithProfile(userId: number): Promise<UserWithProfileFromRepo | null>;
  updateUserWithProfile(userId: number, data: UpdateProfileInput): Promise<UserWithProfileFromRepo>;
}
