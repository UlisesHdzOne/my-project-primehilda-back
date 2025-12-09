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
import { ConfigService } from '@nestjs/config'; // ✅ NUEVO: Importar ConfigService

type CategoryBase = Prisma.CategoryGetPayload<Record<string, never>>;

@Injectable()
export class CategoriesService {
  private readonly maxCategoriesPerPage: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly errorUtils: ErrorUtilsService,
    private readonly businessValidator: CategoryBusinessValidator,
    private readonly configService: ConfigService, // ✅ NUEVO: Inyectar ConfigService
  ) {
    this.logger.log('CategoriesService inicializado');

    this.maxCategoriesPerPage = this.configService.get<number>('app.categories.maxPerPage') || 50;

    const nodeEnv = this.configService.get('app.nodeEnv');
    this.logger.debug('Configuración de CategoriesService cargada', {
      maxCategoriesPerPage: this.maxCategoriesPerPage,
      environment: nodeEnv,
    });
  }

  async findAll(options?: FindAllCategoriesOptions): Promise<PaginatedCategories> {
    return this.errorUtils.withDatabaseErrorHandling('Obtener categorías', async () => {
      const page = options?.page || 1;
      const limit = Math.min(options?.limit || 10, this.maxCategoriesPerPage);
      const skip = (page - 1) * limit;
      const includeProducts = options?.includeProducts || false;
      const nameFilter = options?.name;
      const orderBy = options?.orderBy || 'name';
      const order = options?.order || 'asc';

      // ✅ Construir where clause dinámicamente
      const where: Prisma.CategoryWhereInput = {};

      if (nameFilter) {
        where.name = {
          contains: nameFilter,
          mode: Prisma.QueryMode.insensitive,
        };
      }

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

      // ✅ Mapear orderBy a Prisma
      const orderByClause: Prisma.CategoryOrderByWithRelationInput = {};
      if (orderBy === 'name') {
        orderByClause.name = order;
      } else if (orderBy === 'id') {
        orderByClause.id = order;
      }

      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          skip,
          take: limit,
          where,
          orderBy: orderByClause,
          include: includeClause,
        }),
        this.prisma.category.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log('Categorías obtenidas con paginación', {
        page,
        limit,
        total,
        totalPages,
        returnedCount: categories.length,
        includeProducts,
        hasNameFilter: !!nameFilter,
        orderBy,
        order,
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
        environment: this.configService.get('app.nodeEnv'), // ✅ USAR ConfigService
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

      // if (existing) {
      //   throw new ConflictError('Categoría', 'name');
      // }

      // Usar checkConflict en lugar de lanzar error manualmente
      this.errorUtils.checkConflict(existing, 'Categoría', 'name');

      // 3. ✅ Crear categoría
      const category = await this.prisma.category.create({
        data: input,
      });

      this.logger.log('Categoría creada exitosamente', {
        categoryId: category.id,
        name: category.name,
        environment: this.configService.get('app.nodeEnv'),
        timestamp: new Date().toISOString(),
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

      // if (!currentCategory) {
      //   throw new NotFoundError('Categoría', id);
      // }
      if (!currentCategory) {
        throw this.errorUtils.validateEntityExists(null, 'Categoría', id); // Esto lanzará NotFoundError
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

      // // ✅ CORRECCIÓN: Excluir la categoría actual
      // if (existingWithName && existingWithName.id !== id) {
      //   throw new ConflictError('Categoría', 'name');
      // }
      // Usar checkConflict pero excluyendo el ID actual

      if (existingWithName && existingWithName.id !== id) {
        throw new ErrorUtilsService().checkConflict(existingWithName, 'Categoría', 'name');
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
        environment: this.configService.get('app.nodeEnv'),
        productCount: updatedCategory.products.length,
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
        environment: this.configService.get('app.nodeEnv'),
        timestamp: new Date().toISOString(),
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
        environment: this.configService.get('app.nodeEnv'),
      });

      return category as CategoryWithProductBasic | null;
    });
  }

  // ✅ NUEVO: Método para obtener categorías con conteo de productos
  async findWithProductCount(): Promise<Array<{ id: number; name: string; productCount: number }>> {
    return this.errorUtils.withDatabaseErrorHandling('Obtener categorías con conteo', async () => {
      const categories = await this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          name: Prisma.SortOrder.asc,
        },
      });

      const result = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products,
      }));

      this.logger.debug('Categorías obtenidas con conteo de productos', {
        count: result.length,
        totalProducts: result.reduce((sum, cat) => sum + cat.productCount, 0),
      });

      return result;
    });
  }

  // ✅ NUEVO: Método para verificar si una categoría existe
  async exists(id: number): Promise<boolean> {
    return this.errorUtils.withDatabaseErrorHandling(
      'Verificar existencia de categoría',
      async () => {
        const count = await this.prisma.category.count({
          where: { id },
        });

        return count > 0;
      },
    );
  }

  // ✅ NUEVO: Método para obtener estadísticas
  async getStatistics() {
    return this.errorUtils.withDatabaseErrorHandling(
      'Obtener estadísticas de categorías',
      async () => {
        const [
          totalCategories,
          categoriesWithProducts,
          categoriesWithoutProducts,
          averageProductsPerCategory,
        ] = await Promise.all([
          this.prisma.category.count(),
          this.prisma.category.count({
            where: {
              products: {
                some: {},
              },
            },
          }),
          this.prisma.category.count({
            where: {
              products: {
                none: {},
              },
            },
          }),
          this.prisma.category
            .findMany({
              include: {
                _count: {
                  select: { products: true },
                },
              },
            })
            .then(cats => {
              const totalProducts = cats.reduce((sum, cat) => sum + cat._count.products, 0);
              return cats.length > 0 ? totalProducts / cats.length : 0;
            }),
        ]);

        this.logger.debug('Estadísticas de categorías obtenidas', {
          totalCategories,
          categoriesWithProducts,
          categoriesWithoutProducts,
          averageProductsPerCategory,
        });

        return {
          totalCategories,
          categoriesWithProducts,
          categoriesWithoutProducts,
          averageProductsPerCategory: Number(averageProductsPerCategory.toFixed(2)),
        };
      },
    );
  }
}
