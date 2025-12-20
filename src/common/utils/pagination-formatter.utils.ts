import type {
  EnhancedPaginationMeta,
  EnhancedPaginatedResponse,
  PaginationLinks,
} from '../types/pagination-response.types';
import type {
  EnhancedPaginationQueryDto,
  SortDirection,
} from '../dto/enhanced-pagination-query.dto';
import { PaginationUtils } from './pagination.utils';

export class PaginationFormatter {
  static formatEnhancedResponse<T>(
    data: T[],
    query: EnhancedPaginationQueryDto,
    total: number,
    basePath: string,
    appliedFilters?: string[],
  ): EnhancedPaginatedResponse<T> {
    // Meta básica de paginación
    const basicMeta = PaginationUtils.createMeta(query.page, query.limit, total);

    // Información de ordenamiento
    const sortInfo = query.getSortParams();

    // Links HATEOAS
    const links = this.generateLinks(query, total, basePath);

    // Meta mejorada
    const enhancedMeta: EnhancedPaginationMeta = {
      ...basicMeta,
      ...(sortInfo && { sort: sortInfo }),
      ...(appliedFilters && appliedFilters.length > 0 && { filters: { applied: appliedFilters } }),
      links,
    };

    return {
      data,
      meta: enhancedMeta,
    };
  }

  private static generateLinks(
    query: EnhancedPaginationQueryDto,
    total: number,
    basePath: string,
  ): PaginationLinks {
    const totalPages = Math.ceil(total / query.limit);
    const queryParams = this.buildQueryParams(query);

    return {
      self: `${basePath}?${this.buildPageQuery(query.page, queryParams)}`,
      first: `${basePath}?${this.buildPageQuery(1, queryParams)}`,
      last: `${basePath}?${this.buildPageQuery(totalPages, queryParams)}`,
      next:
        query.page < totalPages
          ? `${basePath}?${this.buildPageQuery(query.page + 1, queryParams)}`
          : null,
      prev:
        query.page > 1 ? `${basePath}?${this.buildPageQuery(query.page - 1, queryParams)}` : null,
    };
  }

  private static buildQueryParams(query: EnhancedPaginationQueryDto): string {
    const params: string[] = [];

    if (query.limit !== 10) params.push(`limit=${query.limit}`);
    if (query.sort) params.push(`sort=${encodeURIComponent(query.sort)}`);
    if (query.search) params.push(`search=${encodeURIComponent(query.search)}`);
    if (query.fields) params.push(`fields=${encodeURIComponent(query.fields)}`);

    return params.join('&');
  }

  private static buildPageQuery(page: number, baseParams: string): string {
    const params = baseParams ? `${baseParams}&page=${page}` : `page=${page}`;
    return params;
  }

  // Helper para construir queries de Prisma con ordenamiento
  static buildOrderBy(
    sortInfo: { field: string; direction: SortDirection } | null,
  ): Record<string, SortDirection> | null {
    if (!sortInfo) return null;

    return {
      [sortInfo.field]: sortInfo.direction,
    };
  }

  // Helper para validar campos de ordenamiento
  static validateSortField(
    field: string,
    allowedFields: string[],
    defaultField: string = 'id',
  ): string {
    return allowedFields.includes(field) ? field : defaultField;
  }
}
