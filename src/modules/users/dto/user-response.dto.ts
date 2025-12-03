// ============================================
// 📁 src/modules/users/dto/user-response.dto.ts
// ============================================

import { Expose } from 'class-transformer';
import type { Role } from '@prisma/client';

/**
 * DTO para serializar usuario en respuestas
 * ✅ Solo campos con @Expose() se incluyen
 */
export class UserResponseDto {
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

  // ❌ password NO tiene @Expose() = se excluye automáticamente
}
