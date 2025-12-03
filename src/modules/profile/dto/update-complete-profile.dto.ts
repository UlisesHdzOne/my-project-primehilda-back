// ============================================
// 📁 src/modules/profile/dto/update-complete-profile.dto.ts
// ============================================

import { IsString, IsOptional, MinLength, MaxLength, Matches, IsUrl } from 'class-validator';

export class UpdateCompleteProfileDto {
  // ============================================
  // Campos de User
  // ============================================

  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name?: string;

  // ============================================
  // Campos de UserProfile
  // ============================================

  @IsOptional()
  @IsString({ message: 'La biografía debe ser texto' })
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser texto' })
  @IsUrl({}, { message: 'La URL del avatar debe ser válida' })
  @MaxLength(500, { message: 'La URL del avatar no puede exceder 500 caracteres' })
  avatarUrl?: string;
}
