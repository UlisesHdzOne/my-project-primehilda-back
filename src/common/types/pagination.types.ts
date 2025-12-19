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

// Tipo para filtros comunes
export interface BaseFilters {
  page?: number;
  limit?: number;
}

// Helper para crear tipos paginados de Prisma
export type Paginated<T> = Promise<PaginatedResponse<T>>;
