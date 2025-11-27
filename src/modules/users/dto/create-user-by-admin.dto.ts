import { IsString, IsPhoneNumber, MinLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserByAdminDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional() // ← La contraseña es opcional para admin
  password?: string;

  @IsEnum(Role as unknown as object, { message: 'El rol debe ser ADMIN o CONSUMER' })
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
