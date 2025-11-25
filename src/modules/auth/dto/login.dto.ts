import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+]{10,15}$/, {
    message: 'El teléfono debe contener solo números y tener entre 10-15 caracteres',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
