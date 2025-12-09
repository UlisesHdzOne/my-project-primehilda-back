// src/categories/categories.service.ts
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
import { ConflictError, NotFoundError } from '@/core/errors/custom.errors';

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

      const validCategory = this.errorUtils.validateEntityExists(category, 'Categoría', id);

      this.logger.log('Categoría obtenida', {
        categoryId: id,
        name: validCategory.name,
        productCount: validCategory.products.length,
      });

      return validCategory as CategoryWithProductDetails;
    });
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.errorUtils.withDatabaseErrorHandling('CrearCategoría', async () => {
      // 1. ✅ Validar reglas de negocio (SIN BD)
      this.businessValidator.validateNameRules(input.name);

      // 2. ✅ Verificar unicidad (CONSULTA BD - en el SERVICIO)
      const existing = await this.prisma.category.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new ConflictError('Categoría', 'name');
      }

      // 3. ✅ Crear categoría
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

  async update(id: number, input: UpdateCategoryInput): Promise<CategoryWithProductDetails> {
    return this.errorUtils.withDatabaseErrorHandling('Actualizar categoría', async () => {
      // 1. Obtener categoría actual
      const currentCategory = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: { id: true, name: true, price: true },
          },
        },
      });

      if (!currentCategory) {
        throw new NotFoundError('Categoría', id);
      }

      // 2. Verificar si hay cambios
      const hasNameChanged = input.name && input.name !== currentCategory.name;

      if (!hasNameChanged) {
        this.logger.log('Solicitud de actualización sin cambios', {
          categoryId: id,
          categoryName: currentCategory.name,
        });
        return currentCategory as CategoryWithProductDetails;
      }

      // 3. ✅ Validar reglas de negocio para el NUEVO nombre
      this.businessValidator.validateNameRules(input.name!);

      // 4. ✅ Verificar unicidad (EXCLUYENDO ID ACTUAL - CORREGIDO)
      const existingWithName = await this.prisma.category.findUnique({
        where: { name: input.name! },
      });

      // ✅ CORRECCIÓN: Excluir la categoría actual
      if (existingWithName && existingWithName.id !== id) {
        throw new ConflictError('Categoría', 'name');
      }

      // 5. Actualizar
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: { name: input.name! },
        include: {
          products: {
            select: { id: true, name: true, price: true },
          },
        },
      });

      this.logger.log('Categoría actualizada exitosamente', {
        categoryId: id,
        oldName: currentCategory.name,
        newName: updatedCategory.name,
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

      const validCategory = this.errorUtils.validateEntityExists(
        categoryWithProducts,
        'Categoría',
        id,
      ) as CategoryWithProductBasic;

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
