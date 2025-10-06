import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { AUTH_MESSAGES } from 'src/common/constants';

export class LoginUserDto {
  @IsEmail({}, { message: AUTH_MESSAGES.emailInvalido })
  @IsNotEmpty({ message: AUTH_MESSAGES.emailInvalido })
  email: string;

  @IsString({ message: AUTH_MESSAGES.passwordDebil })
  @IsNotEmpty({ message: AUTH_MESSAGES.passwordRequerida })
  password: string;
}
