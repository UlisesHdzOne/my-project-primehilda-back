import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Role } from 'src/common/constants/role.enum';
import { AUTH_MESSAGES } from 'src/common/constants';

export class CreateUserDto {
  @IsString({ message: AUTH_MESSAGES.nombreInvalido })
  @Length(2, 50, { message: AUTH_MESSAGES.nombreInvalido })
  name: string;

  @IsString({ message: AUTH_MESSAGES.apellidoInvalido })
  @Length(2, 50, { message: AUTH_MESSAGES.apellidoInvalido })
  lastName: string;

  @IsEmail({}, { message: AUTH_MESSAGES.emailInvalido })
  email: string;

  @IsString({ message: AUTH_MESSAGES.passwordRequerida })
  @Length(8, 100, { message: AUTH_MESSAGES.passwordDebil })
  password: string;

  @IsEnum(Role, { message: AUTH_MESSAGES.rolInvalido })
  role: Role;

  @IsOptional()
  @IsBoolean({ message: AUTH_MESSAGES.isActiveInvalido })
  isActive?: boolean;

  @IsString({ message: AUTH_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: AUTH_MESSAGES.telefonoInvalido })
  phone: string;
}
