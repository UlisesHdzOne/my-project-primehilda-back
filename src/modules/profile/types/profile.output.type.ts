import type { UserSafe } from '@/modules/users/types/user.shared.type';
import type { ProfilePublic } from './profile.shared.type';

export type UserWithProfileOutput = UserSafe & {
  profile?: ProfilePublic;
};
