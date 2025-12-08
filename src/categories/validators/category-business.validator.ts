// categories/validators/category-business.validator.ts
import { Injectable } from '@nestjs/common';
import { AppLogger } from '@/core/logger/winston.config';
import { BusinessRuleError, ConflictError, NotFoundError } from '@/core/errors/custom.errors';
import { PrismaService } from '@/core/database/prisma.service';

// ✅ Solo el tipo que necesitas
export interface ProductBasic {
  id: number;
  name: string;
}

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

  async validateCategoryUpdate(id: number, name?: string): Promise<{ currentName: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Categoría', id);
    }

    if (name && name !== category.name) {
      const duplicate = await this.prisma.category.findUnique({
        where: { name },
      });

      if (duplicate && duplicate.id !== id) {
        this.logger.warn('Intento de actualizar categoría con nombre duplicado', {
          categoryId: id,
          currentName: category.name,
          newName: name,
          duplicateId: duplicate.id,
        });
        throw new ConflictError('Categoría', 'name');
      }
    }

    return { currentName: category.name };
  }

  // ✅ Versión simplificada que SÍ usas
  validateCategoryHasNoProducts(products: ProductBasic[]): void {
    if (products.length > 0) {
      const productNames = products.map(p => p.name);

      this.logger.warn('Intento de eliminar categoría con productos', {
        productCount: products.length,
        productNames,
      });

      throw new BusinessRuleError(
        'CATEGORY_HAS_PRODUCTS',
        `No se puede eliminar la categoría. Tiene ${products.length} productos asociados`,
        {
          productCount: products.length,
          productNames,
        },
      );
    }
  }
}
