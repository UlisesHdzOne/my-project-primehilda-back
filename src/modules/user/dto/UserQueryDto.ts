// src/modules/user/dto/UserQueryDto.ts
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  // Término de búsqueda
  @IsOptional()
  @IsString()
  q?: string;

  // Parámetro de página
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number; // Hacemos la paginación opcional

  // Parámetro de límite
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number; // Hacemos la paginación opcional
}
