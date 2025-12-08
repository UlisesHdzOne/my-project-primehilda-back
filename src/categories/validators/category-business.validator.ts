// src/categories/validators/category-business.validator.ts
import { Injectable } from '@nestjs/common';
import { AppLogger } from '@/core/logger/winston.config';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/core/errors/custom.errors';
import { PrismaService } from '@/core/database/prisma.service';
import { Category, Product } from '@prisma/client';

// ✅ Tipos específicos usando Pick de Prisma
export type ProductBasic = Pick<Product, 'id' | 'name'>;

@Injectable()
export class CategoryBusinessValidator {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {}

  async validateCategoryCreation(name: string): Promise<void> {
    const existing = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      this.logger.warn('Intento de crear categoría con nombre duplicado', { name });
      throw new ConflictError('Categoría', 'name');
    }
  }

  async validateCategoryUpdate(
    id: number,
    name?: string,
  ): Promise<{ currentName: string; existingCategory: Category }> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundError('Categoría', id);
    }

    if (name && name !== existingCategory.name) {
      const duplicate = await this.prisma.category.findUnique({
        where: { name },
      });

      if (duplicate && duplicate.id !== id) {
        this.logger.warn('Intento de actualizar categoría con nombre duplicado', {
          categoryId: id,
          currentName: existingCategory.name,
          newName: name,
          duplicateId: duplicate.id,
        });
        throw new ConflictError('Categoría', 'name');
      }
    }

    return {
      currentName: existingCategory.name,
      existingCategory, // ✅ Devuelve la categoría completa para evitar consulta extra
    };
  }

  validateCategoryHasNoProducts(products: ProductBasic[]): void {
    if (products.length > 0) {
      const productNames = products.map(p => p.name);
      const productIds = products.map(p => p.id);

      this.logger.warn('Intento de eliminar categoría con productos', {
        productCount: products.length,
        productNames,
        productIds,
      });

      throw new BusinessRuleError(
        'CATEGORY_HAS_PRODUCTS',
        `No se puede eliminar la categoría. Tiene ${products.length} productos asociados`,
        {
          productCount: products.length,
          productNames,
          productIds,
        },
      );
    }
  }
}
