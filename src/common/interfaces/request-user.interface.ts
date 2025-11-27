import { Role } from '@prisma/client';

export interface RequestUser {
  id: number;
  phone: string;
  role: Role;
  iat?: number; // JWT issued at
  exp?: number; // JWT expiration
}