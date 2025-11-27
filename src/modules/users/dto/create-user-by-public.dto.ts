import { IsString, IsPhoneNumber, MinLength } from 'class-validator';

export class CreateUserByPublicDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
