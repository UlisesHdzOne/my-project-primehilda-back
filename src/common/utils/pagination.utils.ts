import type { PaginationMeta, PaginatedResponse } from '../types/pagination.types';

export class PaginationUtils {
  static createMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static createResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.createMeta(page, limit, total),
    };
  }

  // Nuevo método para calcular skip y take
  static getSkipTake(page: number, limit: number): { skip: number; take: number } {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  // Validar límites máximos
  static validateLimit(limit: number, maxLimit: number = 100): number {
    return Math.min(Math.max(limit, 1), maxLimit);
  }

  // Validar página
  static validatePage(page: number): number {
    return Math.max(page, 1);
  }
}
