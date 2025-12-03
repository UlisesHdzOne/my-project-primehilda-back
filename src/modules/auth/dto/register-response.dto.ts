import { Expose } from 'class-transformer';
import type { Role } from '@prisma/client';
import type { UserSafe } from '@/modules/users/types/user.shared.type';

export class RegisterResponseDto implements UserSafe {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  phone!: string;

  @Expose()
  role!: Role;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
