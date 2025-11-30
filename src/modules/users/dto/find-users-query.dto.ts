import { IsOptional, IsString, IsNumber, Min, IsEnum, IsBoolean, Max, MaxLength, IsIn } from 'class-validator';
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
  @IsIn(['id', 'name', 'phone', 'createdAt', 'updatedAt'], {
    message: 'El campo de ordenamiento no es válido',
  })
  orderBy?: keyof UserResponseDto = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'La dirección de ordenamiento debe ser asc o desc' })
  orderDirection?: 'asc' | 'desc' = 'desc';
}
