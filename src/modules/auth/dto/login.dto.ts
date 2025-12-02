import { IsNotEmpty, IsString, MaxLength, MinLength, IsPhoneNumber } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('MX', { message: 'El número de teléfono debe ser válido para Mexico' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  phone!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
