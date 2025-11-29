import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateCompleteProfileDto {
  // Campos de User
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name?: string;

  // Campos de UserProfile
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  bio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+\..+/, {
    message: 'La URL del avatar debe ser una URL válida',
  })
  avatarUrl?: string;
}
