import { Role } from '@prisma/client';
import {
  IsString,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserByAdminDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
  @IsNotEmpty()
  name!: string;

  @IsPhoneNumber('PE')
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  @IsOptional() // ← Sigue siendo opcional para admin
  password?: string;

  @IsEnum(Role as unknown as object, { message: 'El rol debe ser ADMIN o CONSUMER' })
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
