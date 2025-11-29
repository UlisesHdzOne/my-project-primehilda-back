import { IsOptional, IsString, IsNumber, Min, IsEnum, IsBoolean, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { UserResponseDto } from './user-response.dto';

export class FindUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El skip no puede ser negativo' })
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'El take debe ser al menos 1' })
  @Max(100, { message: 'El take no puede exceder 100' })
  take?: number = 10;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La búsqueda no puede exceder 100 caracteres' })
  search?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser ADMIN o CONSUMER' })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  orderBy?: keyof UserResponseDto = 'createdAt';

  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc' = 'desc';
}
