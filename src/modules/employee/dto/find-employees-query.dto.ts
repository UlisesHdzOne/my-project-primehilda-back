import { IsOptional, IsString } from 'class-validator';
import { EnhancedPaginationQueryDto } from '@/common/dto/enhanced-pagination-query.dto';

export class FindEmployeesQueryDto extends EnhancedPaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  getAppliedFilters(): string[] {
    const filters: string[] = [];

    if (this.name) filters.push(`name=${this.name}`);
    if (this.search) filters.push(`search=${this.search}`);
    if (this.sort) filters.push(`sort=${this.sort}`);

    return filters;
  }

  getNormalizedSearch(): string | null {
    if (!this.search) return null;
    return this.search.trim().toLowerCase();
  }
}
