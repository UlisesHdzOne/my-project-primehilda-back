import { Expose, Type } from 'class-transformer';
import type { Role } from '@prisma/client';

/**
 * DTO para usuario en respuestas de auth
 */
export class AuthUserDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  phone!: string;

  @Expose()
  role!: Role;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}

/**
 * DTO para tokens
 */
export class AuthTokensDto {
  @Expose()
  access_token!: string;

  @Expose()
  refresh_token?: string;
}

/**
 * DTO para respuesta de login/register
 */
export class AuthResponseDto {
  @Expose()
  @Type(() => AuthTokensDto)
  tokens!: AuthTokensDto;

  @Expose()
  @Type(() => AuthUserDto)
  user!: AuthUserDto;
}
