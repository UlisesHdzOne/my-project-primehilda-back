import type { Role } from '@prisma/client';
import type { UserSafe } from '@/modules/users/types/user-safe.type';
import type { ProfilePublic } from '../types/profile-safe.type';

export class UserWithProfileResponseDto implements UserSafe {
  // User fields
  id!: number;
  name!: string;
  phone!: string;
  role!: Role;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Profile fields (opcionales)
  profile?: ProfilePublic;
}
