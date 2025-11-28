import { UserProfile } from '@prisma/client';

export interface IProfileRepository {
  findByUserId(userId: number): Promise<UserProfile | null>;
  upsert(userId: number, data: Partial<UserProfile>): Promise<UserProfile>;
}
