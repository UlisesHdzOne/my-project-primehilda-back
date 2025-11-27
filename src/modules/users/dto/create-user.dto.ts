import { IsString, IsPhoneNumber, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum([Role.ADMIN, Role.CONSUMER], { message: 'El rol debe ser ADMIN o CONSUMER' })
  role?: Role;
}
