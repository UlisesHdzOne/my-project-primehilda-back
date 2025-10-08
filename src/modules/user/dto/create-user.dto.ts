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
import { USER_MESSAGES } from 'src/common/constants';

export class CreateUserDto {
  @IsString({ message: USER_MESSAGES.nombreInvalido })
  @Length(2, 50, { message: USER_MESSAGES.nombreInvalido })
  name: string;

  @IsString({ message: USER_MESSAGES.apellidoInvalido })
  @Length(2, 50, { message: USER_MESSAGES.apellidoInvalido })
  lastName: string;

  @IsEmail({}, { message: USER_MESSAGES.emailInvalido })
  email: string;

  @IsString({ message: USER_MESSAGES.passwordRequerida })
  @Length(8, 100, { message: USER_MESSAGES.passwordDebil })
  password: string;

  @IsEnum(Role, { message: USER_MESSAGES.rolInvalido })
  role: Role;

  @IsOptional()
  @IsBoolean({ message: USER_MESSAGES.isActiveInvalido })
  isActive?: boolean;

  @IsString({ message: USER_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: USER_MESSAGES.telefonoInvalido })
  phone: string;
}
