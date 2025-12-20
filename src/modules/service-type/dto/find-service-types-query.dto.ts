// src/modules/service-type/dto/find-service-types-query.dto.ts
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EnhancedPaginationQueryDto } from '@/common/dto/enhanced-pagination-query.dto';

export class FindServiceTypesQueryDto extends EnhancedPaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minDuration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxDuration?: number;

  getAppliedFilters(): string[] {
    const filters: string[] = [];

    if (this.minPrice !== undefined) filters.push(`minPrice=${this.minPrice}`);
    if (this.maxPrice !== undefined) filters.push(`maxPrice=${this.maxPrice}`);
    if (this.minDuration !== undefined) filters.push(`minDuration=${this.minDuration}`);
    if (this.maxDuration !== undefined) filters.push(`maxDuration=${this.maxDuration}`);
    if (this.search) filters.push(`search=${this.search}`);
    if (this.sort) filters.push(`sort=${this.sort}`);

    return filters;
  }

  getNormalizedSearch(): string | null {
    if (!this.search) return null;
    return this.search.trim().toLowerCase();
  }
}
