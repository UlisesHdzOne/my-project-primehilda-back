// ============================================
// 📁 src/modules/users/dto/users-list-response.dto.ts
// ============================================

import { Expose, Type } from 'class-transformer';

/**
 * DTO para un item de usuario en listas
 */
export class UserListItemDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  phone!: string;
}

/**
 * DTO para respuesta de lista de usuarios
 */
export class UsersListResponseDto {
  @Expose()
  @Type(() => UserListItemDto)
  users!: UserListItemDto[];

  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  pageSize!: number;
}
