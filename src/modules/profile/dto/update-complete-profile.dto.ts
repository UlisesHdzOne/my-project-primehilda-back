import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateCompleteProfileDto {
  // Campos de User
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  // Campos de UserProfile
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // ❌ NO incluir: password, role, phone, isActive
  // (estos van en endpoints específicos de administración)
}
