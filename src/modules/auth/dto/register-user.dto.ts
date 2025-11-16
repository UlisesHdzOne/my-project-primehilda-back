import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { AUTH_MESSAGES } from 'src/common/constants';

export class RegisterDto {
  @IsString({ message: AUTH_MESSAGES.nombreInvalido })
  @IsNotEmpty({ message: AUTH_MESSAGES.nombreRequerido })
  name: string;

  @IsString({ message: AUTH_MESSAGES.apellidoInvalido })
  @IsNotEmpty({ message: AUTH_MESSAGES.apellidoRequerido })
  lastName: string;

  @IsEmail({}, { message: AUTH_MESSAGES.emailInvalido })
  @IsNotEmpty({ message: AUTH_MESSAGES.emailRequerido })
  email: string;

  @IsString({ message: AUTH_MESSAGES.passwordNoString })
  @IsNotEmpty({ message: AUTH_MESSAGES.passwordRequerida })
  @MinLength(8, { message: AUTH_MESSAGES.passwordDebil })
  password: string;

  @IsString({ message: AUTH_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: AUTH_MESSAGES.telefonoInvalido })
  phone: string;
}
