export * from './pagination-response.types';

// Mantener tipos básicos existentes
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BaseFilters {
  page?: number;
  limit?: number;
}

export type Paginated<T> = Promise<PaginatedResponse<T>>;
