// categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma, Category } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import { AppLogger } from '@/core/logger/winston.config';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { CategoryBusinessValidator } from './validators/category-business.validator';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  FindAllCategoriesOptions,
  CategoryWithProductDetails,
  CategoryWithProductBasic,
  PaginatedCategories,
} from './types/category.types';

type CategoryBase = Prisma.CategoryGetPayload<Record<string, never>>;

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly errorUtils: ErrorUtilsService,
    private readonly businessValidator: CategoryBusinessValidator,
  ) {
    this.logger.log('CategoriesService inicializado');
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.errorUtils.withDatabaseErrorHandling('CrearCategoría', async () => {
      await this.businessValidator.validateCategoryCreation(input.name);

      const category = await this.prisma.category.create({
        data: input,
      });

      this.logger.log('Categoría creada exitosamente', {
        categoryId: category.id,
        name: category.name,
      });

      return category;
    });
  }

  async findAll(options?: FindAllCategoriesOptions): Promise<PaginatedCategories> {
    return this.errorUtils.withDatabaseErrorHandling('Obtener categorías', async () => {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;
      const includeProducts = options?.includeProducts || false;

      const includeClause: Prisma.CategoryInclude | undefined = includeProducts
        ? {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
              },
              orderBy: {
                name: Prisma.SortOrder.asc,
              },
            },
          }
        : undefined;

      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          skip,
          take: limit,
          orderBy: { name: Prisma.SortOrder.asc },
          include: includeClause,
        }),
        this.prisma.category.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log('Categorías obtenidas con paginación', {
        page,
        limit,
        total,
        totalPages,
        returnedCount: categories.length,
        includeProducts,
      });

      return {
        data: categories as (CategoryWithProductDetails | CategoryBase)[],
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    });
  }

  async findOne(id: number): Promise<CategoryWithProductDetails> {
    return this.errorUtils.withDatabaseErrorHandling('Obtener categoría', async () => {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: { id: true, name: true, price: true },
            orderBy: { name: Prisma.SortOrder.asc },
          },
        },
      });

      const validCategory = this.errorUtils.validateOrThrow(category, 'Categoría', id);

      this.logger.log('Categoría obtenida', {
        categoryId: id,
        name: validCategory.name,
        productCount: validCategory.products.length,
      });

      return validCategory as CategoryWithProductDetails;
    });
  }

  async update(id: number, input: UpdateCategoryInput): Promise<CategoryWithProductDetails> {
    return this.errorUtils.withDatabaseErrorHandling('Actualizar categoría', async () => {
      const { currentName } = await this.businessValidator.validateCategoryUpdate(id, input.name);

      if (!input.name || input.name === currentName) {
        this.logger.log('Sin cambios en la categoría', { categoryId: id });

        const unchangedCategory = await this.prisma.category.findUnique({
          where: { id },
          include: {
            products: {
              select: { id: true, name: true, price: true },
            },
          },
        });

        const validCategory = this.errorUtils.validateOrThrow(unchangedCategory, 'Categoría', id);

        return validCategory as CategoryWithProductDetails;
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: input,
        include: {
          products: {
            select: { id: true, name: true, price: true },
          },
        },
      });

      const changedFields = (Object.keys(input) as Array<keyof UpdateCategoryInput>).filter(
        key => input[key] !== undefined,
      );

      this.logger.log('Categoría actualizada', {
        categoryId: id,
        oldName: currentName,
        newName: updatedCategory.name,
        changedFields,
      });

      return updatedCategory as CategoryWithProductDetails;
    });
  }

  async remove(id: number): Promise<Category> {
    return this.errorUtils.withDatabaseErrorHandling('Eliminar categoría', async () => {
      const categoryWithProducts = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: { id: true, name: true },
          },
        },
      });

      const validCategory = this.errorUtils.validateOrThrow(
        categoryWithProducts,
        'Categoría',
        id,
      ) as CategoryWithProductBasic;

      // ✅ Tipado correcto sin 'as'
      this.businessValidator.validateCategoryHasNoProducts(validCategory.products);

      const deletedCategory = await this.prisma.category.delete({
        where: { id },
      });

      this.logger.log('Categoría eliminada', {
        categoryId: id,
        name: deletedCategory.name,
      });

      return deletedCategory;
    });
  }

  async findByName(name: string): Promise<CategoryWithProductBasic | null> {
    return this.errorUtils.withDatabaseErrorHandling('Buscar categoría por nombre', async () => {
      const category = await this.prisma.category.findUnique({
        where: { name },
        include: {
          products: {
            select: { id: true, name: true },
          },
        },
      });

      this.logger.debug('Búsqueda de categoría por nombre', {
        name,
        found: !!category,
        productCount: category?.products?.length || 0,
      });

      return category as CategoryWithProductBasic | null;
    });
  }
}
