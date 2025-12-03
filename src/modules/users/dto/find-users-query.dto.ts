// ============================================
// 📁 src/modules/users/dto/find-users-query.dto.ts
// ============================================

import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class FindUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'skip debe ser un número' })
  @Min(0, { message: 'skip no puede ser negativo' })
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'take debe ser un número' })
  @Min(1, { message: 'take debe ser al menos 1' })
  @Max(100, { message: 'take no puede exceder 100' })
  take?: number = 10;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  @MaxLength(100, { message: 'La búsqueda no puede exceder 100 caracteres' })
  search?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser ADMIN o CONSUMER' })
  role?: Role;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'orderBy debe ser texto' })
  @IsIn(['id', 'name', 'phone', 'createdAt', 'updatedAt'], {
    message: 'orderBy debe ser: id, name, phone, createdAt o updatedAt',
  })
  orderBy?: 'id' | 'name' | 'phone' | 'createdAt' | 'updatedAt' = 'createdAt';

  @IsOptional()
  @IsString({ message: 'orderDirection debe ser texto' })
  @IsIn(['asc', 'desc'], {
    message: 'orderDirection debe ser asc o desc',
  })
  orderDirection?: 'asc' | 'desc' = 'desc';
}
