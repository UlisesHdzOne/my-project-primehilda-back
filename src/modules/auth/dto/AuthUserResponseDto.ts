import { UserPublicEntity } from '../entities/user.public.entity.js';

export class AuthUserResponseDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;

  constructor(partial: Partial<AuthUserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: UserPublicEntity): AuthUserResponseDto {
    return new AuthUserResponseDto({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });
  }
}
