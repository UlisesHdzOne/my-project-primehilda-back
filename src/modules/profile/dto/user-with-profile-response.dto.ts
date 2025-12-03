// ============================================
// 📁 src/modules/profile/dto/user-with-profile-response.dto.ts
// ============================================

import { Expose, Type } from 'class-transformer';
import type { Role } from '@prisma/client';
import { ProfileResponseDto } from './profile-response.dto';

/**
 * DTO para usuario con perfil en respuestas
 */
export class UserWithProfileResponseDto {
  // ============================================
  // Campos de User
  // ============================================

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

  // ============================================
  // Perfil (opcional)
  // ============================================

  @Expose()
  @Type(() => ProfileResponseDto)
  profile?: ProfileResponseDto;
}
