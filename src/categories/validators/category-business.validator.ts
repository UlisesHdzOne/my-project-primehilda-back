import { Injectable } from '@nestjs/common';
import { AppLogger } from '@/core/logger/winston.config';
import { BusinessRuleError, ValidationError } from '@/core/errors/custom.errors';
import { Product } from '@prisma/client';

export type ProductBasic = Pick<Product, 'id' | 'name'>;

@Injectable()
export class CategoryBusinessValidator {
  constructor(private readonly logger: AppLogger) {} // ❌ ELIMINAR PrismaService

  // ✅ REGLAS DE NEGOCIO (SIN BD)
  validateNameRules(name: string): void {
    const errors: Array<{ field: string; message: string }> = [];

    if (name.trim().length !== name.length) {
      errors.push({ field: 'name', message: 'No puede empezar o terminar con espacios' });
    }

    const reservedWords = ['admin', 'system', 'root'];
    if (reservedWords.includes(name.toLowerCase())) {
      errors.push({
        field: 'name',
        message: `"${name}" está reservado. Use: ${reservedWords.join(', ')}`,
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  // ✅ Validar con datos YA OBTENIDOS (no consulta BD)
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
