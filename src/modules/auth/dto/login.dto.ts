import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^[0-9+\-\s()]{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos y puede incluir +, -, (, ) o espacios',
  })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  phone!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
