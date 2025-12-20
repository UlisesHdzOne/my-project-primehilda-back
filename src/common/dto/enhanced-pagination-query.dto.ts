import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class EnhancedPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  fields?: string;

  // Método para parsear el campo de ordenamiento
  getSortParams(): { field: string; direction: SortDirection } | null {
    if (!this.sort) return null;

    const parts = this.sort.split(':');
    if (parts.length !== 2) return null;

    const field = parts[0].trim();
    const direction = parts[1].trim().toLowerCase();

    if (!Object.values(SortDirection).includes(direction as SortDirection)) {
      return null;
    }

    return {
      field,
      direction: direction as SortDirection,
    };
  }

  // Método para obtener array de campos seleccionados
  getSelectedFields(): string[] | null {
    if (!this.fields) return null;

    return this.fields
      .split(',')
      .map(field => field.trim())
      .filter(field => field.length > 0);
  }

  // Método para obtener búsqueda normalizada
  getNormalizedSearch(): string | null {
    if (!this.search) return null;

    return this.search.trim().toLowerCase();
  }
}
