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
import { USER_MESSAGES } from 'src/common/constants';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: USER_MESSAGES.nombreInvalido })
  @MinLength(2, { message: USER_MESSAGES.nombreInvalido })
  name?: string;

  @IsOptional()
  @IsString({ message: USER_MESSAGES.apellidoInvalido })
  @MinLength(2, { message: USER_MESSAGES.apellidoInvalido })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: USER_MESSAGES.emailInvalido })
  email?: string;

  @IsOptional()
  @IsString({ message: USER_MESSAGES.passwordDebil })
  @MinLength(8, { message: USER_MESSAGES.passwordDebil })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: USER_MESSAGES.rolInvalido })
  role?: Role;

  @IsOptional()
  @IsBoolean({ message: USER_MESSAGES.isActiveInvalido })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: USER_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: USER_MESSAGES.telefonoInvalido })
  phone?: string;
}
