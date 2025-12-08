import type { Prisma } from '@prisma/client';

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface FindAllCategoriesOptions {
  page?: number;
  limit?: number;
  includeProducts?: boolean;
}

// ✅ Estos tipos SÍ los usas en CategoriesService
export type CategoryWithProductDetails = Prisma.CategoryGetPayload<{
  include: {
    products: {
      select: {
        id: true;
        name: true;
        price: true;
      };
    };
  };
}>;

export type CategoryWithProductBasic = Prisma.CategoryGetPayload<{
  include: {
    products: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

// ✅ Tipo para paginación genérica
export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

// ✅ Tipo específico para categories
export type PaginatedCategories = PaginatedResponse<
  CategoryWithProductDetails | Prisma.CategoryGetPayload<Record<string, never>>
>;

// ✅ Tipo helper para extraer productos
//export type ExtractProducts<T> = T extends { products: infer P } ? P : never;