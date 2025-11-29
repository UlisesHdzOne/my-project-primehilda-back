import type { UserProfile } from '@prisma/client';

export type ProfileSafe = Pick<UserProfile, 'id' | 'userId' | 'bio' | 'avatarUrl'>;
