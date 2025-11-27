import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserResponseDto {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;

  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
}
