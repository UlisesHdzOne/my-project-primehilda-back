import { User } from '@prisma/client';
import { Role } from 'src/common/constants/role.enum';

export class UserPublicEntity {
  readonly id: number;
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly role: Role;
  readonly isActive: boolean;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }

  static fromPrisma(user: User): UserPublicEntity {
    const { password, ...safeData } = user;
    return new UserPublicEntity(safeData);
  }
}
