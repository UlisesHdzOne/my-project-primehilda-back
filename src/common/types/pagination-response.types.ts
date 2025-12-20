// import { SortDirection } from '../dto/enhanced-pagination-query.dto';

import type { SortDirection } from '../dto/enhanced-pagination-query.dto';
import type { PaginationMeta } from './pagination.types';

// Extender el meta existente
export interface EnhancedPaginationMeta extends PaginationMeta {
  filters?: AppliedFilters;
  sort?: SortInfo;
  links?: PaginationLinks;
}

// Tipos para los nuevos campos
export interface AppliedFilters {
  applied: string[];
  available?: string[];
}

export interface SortInfo {
  field: string;
  direction: SortDirection;
}

export interface PaginationLinks {
  self: string;
  first: string;
  last: string;
  next: string | null;
  prev: string | null;
}

// Response mejorada
export interface EnhancedPaginatedResponse<T> {
  data: T[];
  meta: EnhancedPaginationMeta;
}

// Helper type para filtros aplicados
export interface FilterItem {
  field: string;
  value: string | number | boolean;
  operator?: string;
}
