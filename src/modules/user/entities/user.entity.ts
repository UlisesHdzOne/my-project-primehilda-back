// src/modules/user/entities/user.entity.ts
import { User } from '@prisma/client';

export class UserEntity {
  readonly id: number;
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly role: string;
  readonly document?: string;
  readonly notes?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
    this.isActive = user.isActive ?? true;
    this.document = user.document ?? undefined;
    this.notes = user.notes ?? undefined;
    this.role = user.role ?? 'CONSUMER'; // ✅ Valor por defecto seguro
  }

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get isConsumer(): boolean {
    return this.role === 'CONSUMER';
  }

  static fromPrisma(user: User): UserEntity {
    const { password, ...safeData } = user;
    return new UserEntity(safeData);
  }
}
