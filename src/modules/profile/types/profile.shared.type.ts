import type { UserProfileBase } from '@/common/types/base.types';

export type ProfileSafe = Pick<UserProfileBase, 'id' | 'userId' | 'bio' | 'avatarUrl'>;
export type ProfilePublic = Pick<UserProfileBase, 'id' | 'bio' | 'avatarUrl'>;
