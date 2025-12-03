// ============================================
// 📁 src/modules/profile/dto/profile-response.dto.ts
// ============================================

import { Expose } from 'class-transformer';

/**
 * DTO para perfil público
 */
export class ProfileResponseDto {
  @Expose()
  id!: number;

  @Expose()
  bio!: string | null;

  @Expose()
  avatarUrl!: string | null;
}
