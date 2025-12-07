import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  FindAllCategoriesOptions,
} from './types/category.types';
import { AppLogger } from '@/core/logger/winston.config';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { ConflictError } from '@/core/errors/custom.errors';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly errorUtils: ErrorUtilsService,
  ) {
    this.logger.log('CategoriesService inicializado');
  }

  async create(input: CreateCategoryInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearCategoría', async () => {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: input.name },
      });

      //this.errorUtils.checkConflict(existingCategory, 'Categoría', 'nombre');

      if (existingCategory) {
        this.logger.warn('Intento de crear categoría con nombre duplicado', { name: input.name });
        throw new ConflictError('Categoría', 'name');
      }

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

  async findAll(options?: FindAllCategoriesOptions) {
    return this.errorUtils.withDatabaseErrorHandling('Obtener categorías', async () => {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: options?.includeProducts
            ? {
                products: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                  orderBy: { name: 'asc' },
                },
              }
            : undefined,
        }),
        this.prisma.category.count(),
      ]);

      this.logger.log(`Categorías obtenidas: ${categories.length} de ${total}`, {
        page,
        limit,
        total,
      });

      return {
        data: categories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('Obtener categoría', async () => {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
            },
            orderBy: { name: 'asc' },
          },
        },
      });

      const validCategory = this.errorUtils.validateOrThrow(category, 'Categoría', id);

      this.logger.log('Categoría obtenida', {
        categoryId: id,
        name: validCategory.name,
      });

      return validCategory;
    });
  }

  async update(id: number, input: UpdateCategoryInput) {
    return this.errorUtils.withDatabaseErrorHandling('Actualizar categoría', async () => {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      const validExistingCategory = this.errorUtils.validateOrThrow(
        existingCategory,
        'Categoría',
        id,
      );

      // ✅ Mejor validación: Solo verificar conflicto si el nombre cambió Y es diferente
      if (input.name && input.name !== validExistingCategory.name) {
        const duplicateCategory = await this.prisma.category.findUnique({
          where: { name: input.name },
        });

        // ✅ Verificar que no sea la misma categoría (por si acaso)
        if (duplicateCategory && duplicateCategory.id !== id) {
          this.errorUtils.checkConflict(duplicateCategory, 'Categoría', 'nombre');
        }
      }

      // ✅ No actualizar si no hay cambios reales
      if (!input.name || input.name === validExistingCategory.name) {
        this.logger.log('Sin cambios en la categoría', { categoryId: id });
        return validExistingCategory;
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: input,
      });

      const changes = (Object.keys(input) as Array<keyof UpdateCategoryInput>).filter(
        key =>
          input[key] !== undefined &&
          input[key] !== validExistingCategory[key as keyof typeof validExistingCategory],
      );

      this.logger.log('Categoría actualizada', {
        categoryId: id,
        changes,
        oldName: validExistingCategory.name,
        newName: updatedCategory.name,
      });

      return updatedCategory;
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('Eliminar categoría', async () => {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: { id: true, name: true },
          },
        },
      });

      const validExistingCategory = this.errorUtils.validateOrThrow(
        existingCategory,
        'Categoría',
        id,
      );

      if (validExistingCategory.products.length > 0) {
        this.logger.warn('Intento de eliminar categoría con productos', {
          categoryId: id,
          categoryName: validExistingCategory.name,
          productCount: validExistingCategory.products.length,
          productNames: validExistingCategory.products.map(p => p.name),
        });

        throw new Error(
          `No se puede eliminar la categoría "${validExistingCategory.name}". ` +
            `Tiene ${validExistingCategory.products.length} productos asociados. ` +
            'Elimine los productos primero.',
        );
      }

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

  async findByName(name: string) {
    return this.errorUtils.withDatabaseErrorHandling('Buscar categoría por nombre', async () => {
      const category = await this.prisma.category.findUnique({
        where: { name },
      });

      this.logger.debug('Búsqueda por nombre', {
        name,
        found: !!category,
      });

      return category;
    });
  }
}
