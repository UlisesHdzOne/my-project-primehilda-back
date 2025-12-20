// src/modules/cars/dto/find-cars-query.dto.ts - CREAR NUEVO ARCHIVO
import { IsOptional, IsString } from 'class-validator';
import { EnhancedPaginationQueryDto } from '@/common/dto/enhanced-pagination-query.dto';
export class FindCarsQueryDto extends EnhancedPaginationQueryDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string; // ✅ Podrías agregar filtro por modelo

  @IsOptional()
  @IsString()
  color?: string;

  // ✅ Agregar método getNormalizedSearch (como en WashOrder)
  getNormalizedSearch(): string | null {
    if (!this.search) return null;
    return this.search.trim().toLowerCase();
  }

  getAppliedFilters(): string[] {
    const filters: string[] = [];

    if (this.brand) filters.push(`brand=${this.brand}`);
    if (this.model) filters.push(`model=${this.model}`);
    if (this.color) filters.push(`color=${this.color}`);
    if (this.search) filters.push(`search=${this.search}`);
    if (this.sort) filters.push(`sort=${this.sort}`);

    return filters;
  }
}
