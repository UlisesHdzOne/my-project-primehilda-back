// categories/types/category.types.ts
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

export type PaginatedCategories = {
  data: CategoryWithProductDetails[] | Prisma.CategoryGetPayload<Record<string, never>>[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
