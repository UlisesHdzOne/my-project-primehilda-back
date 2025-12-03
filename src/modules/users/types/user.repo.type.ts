import type { Role, User } from '@prisma/client';

/**
 * Tipos específicos para el repositorio (coinciden con Prisma)
 */
export type UserFromRepo = {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPasswordFromRepo = User;
