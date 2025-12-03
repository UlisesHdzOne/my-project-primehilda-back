import type { Role } from '@prisma/client';

export type UserWithProfileFromRepo = {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: number;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
};

export type UpdatedUserWithProfile = UserWithProfileFromRepo;
