import { IsNotEmpty, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('PE', { message: 'El número de teléfono debe ser válido para Perú' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  phone!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
