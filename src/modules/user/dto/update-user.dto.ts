import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Role } from 'src/common/constants/role.enum';
import { AUTH_MESSAGES } from 'src/common/constants';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: AUTH_MESSAGES.nombreInvalido })
  @MinLength(2, { message: AUTH_MESSAGES.nombreInvalido })
  name?: string;

  @IsOptional()
  @IsString({ message: AUTH_MESSAGES.apellidoInvalido })
  @MinLength(2, { message: AUTH_MESSAGES.apellidoInvalido })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: AUTH_MESSAGES.emailInvalido })
  email?: string;

  @IsOptional()
  @IsString({ message: AUTH_MESSAGES.passwordDebil })
  @MinLength(8, { message: AUTH_MESSAGES.passwordDebil })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: AUTH_MESSAGES.rolInvalido })
  role?: Role;

  @IsOptional()
  @IsBoolean({ message: AUTH_MESSAGES.isActiveInvalido })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: AUTH_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: AUTH_MESSAGES.telefonoInvalido })
  phone?: string;
}
