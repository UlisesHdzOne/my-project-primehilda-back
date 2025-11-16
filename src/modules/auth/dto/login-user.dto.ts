import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { AUTH_MESSAGES } from 'src/common/constants';

export class LoginDto {
  @IsEmail({}, { message: AUTH_MESSAGES.emailInvalido })
  @IsNotEmpty({ message: AUTH_MESSAGES.emailRequerido })
  email: string;

  @IsString({ message: AUTH_MESSAGES.passwordNoString })
  @IsNotEmpty({ message: AUTH_MESSAGES.passwordRequerida })
  password: string;
}
