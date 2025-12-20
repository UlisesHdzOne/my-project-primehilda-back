import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { EnhancedPaginationQueryDto } from '@/common/dto/enhanced-pagination-query.dto';

export class FindCarDetailsQueryDto extends EnhancedPaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  carId?: number;

  getAppliedFilters(): string[] {
    const filters: string[] = [];

    if (this.carId !== undefined) filters.push(`carId=${this.carId}`);
    if (this.search) filters.push(`search=${this.search}`);
    if (this.sort) filters.push(`sort=${this.sort}`);

    return filters;
  }

  getNormalizedSearch(): string | null {
    if (!this.search) return null;
    return this.search.trim().toLowerCase();
  }
}
