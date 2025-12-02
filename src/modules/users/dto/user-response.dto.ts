import type { Role } from '@prisma/client';
import type { UserSafe } from '../types/user-safe.type';

export class UserResponseDto implements UserSafe {
  id!: number;
  name!: string;
  phone!: string;
  role!: Role;
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}
