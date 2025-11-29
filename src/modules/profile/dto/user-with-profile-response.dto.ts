import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserWithProfileResponseDto {
  // User fields
  id!: number;
  name!: string;
  phone!: string;
  role!: Role;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Profile fields (opcionales)
  profile?: {
    id: number;
    bio: string | null;
    avatarUrl: string | null;
  };

  @Exclude()
  password!: string;
}
