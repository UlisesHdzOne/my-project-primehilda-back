// src/modules/products/validators-business/rules/product.rules.ts

import { PrismaService } from 'src/prisma/prisma.service';
import { ProductType } from 'src/common/constants/product-types.enum';
import { OrderType } from 'src/common/constants/order-type.enum';
import { FreeOptionDto } from '../../dto/free-option.dto';

// --- CAMBIO CLAVE AQUÍ ---
// 🟢 Usamos un mapeo de tipo para asegurarnos de que solo se extraigan los valores de string/ProductType.
const VALID_PRODUCT_TYPES: Set<ProductType> = new Set(
  Object.values(ProductType).filter(
    (val) => typeof val === 'string',
  ) as ProductType[],
);
const VALID_ORDER_TYPES: Set<OrderType> = new Set(
  Object.values(OrderType).filter(
    (val) => typeof val === 'string',
  ) as OrderType[],
);
// --- FIN DEL CAMBIO ---

export const ProductRules = {
  async isNameUnique(
    name: string,
    prisma: PrismaService,
    productId?: number,
  ): Promise<boolean> {
    const existing = await prisma.product.findFirst({
      where: productId ? { name, NOT: { id: productId } } : { name },
    });
    return !existing;
  },

  isValidName(name: string): boolean {
    return !!name && name.trim().length >= 3;
  },

  isValidPrice(price: number): boolean {
    return price != null && typeof price === 'number' && price > 0;
  },

  isValidCategory(category: string): boolean {
    // Ya no se necesita aserción aquí
    return VALID_PRODUCT_TYPES.has(category as ProductType);
  },

  /**
   * REGLA: Valida que las opciones gratis sean válidas y no estén duplicadas por (Categoría, Tipo de Orden).
   */
  isValidFreeOptions(freeOptions: FreeOptionDto[]): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];
    if (!freeOptions || freeOptions.length === 0) return { valid: true };

    let total = 0;
    const uniqueOptions = new Set<string>();

    freeOptions.forEach((opt, i) => {
      // Ya no se necesita aserción ni supresión de ESLint
      if (!VALID_PRODUCT_TYPES.has(opt.category)) {
        errors.push(
          `La categoría de freeOption en posición ${i} ('${opt.category}') no es válida.`,
        );
      }

      if (opt.quantity <= 0) {
        errors.push(
          `La cantidad de freeOption en posición ${i} debe ser mayor a 0.`,
        );
      }

      // Ya no se necesita aserción ni supresión de ESLint
      if (!VALID_ORDER_TYPES.has(opt.orderType)) {
        errors.push(
          `El tipo de orden de freeOption en posición ${i} ('${opt.orderType}') no es válido. Debe ser NORMAL o EVENT.`,
        );
      }

      // Validación de Duplicados (Categoría, Tipo de Orden)
      const key = `${opt.category}:${opt.orderType}`;
      if (uniqueOptions.has(key)) {
        errors.push(
          `Ya existe una opción de regalo para la Categoría '${opt.category}' y Tipo de Orden '${opt.orderType}' en este producto. No se permiten duplicados.`,
        );
      }
      uniqueOptions.add(key);

      total += opt.quantity;
    });

    if (total > 10)
      errors.push('La cantidad total de productos gratis no puede exceder 10.');

    return { valid: errors.length === 0, errors };
  },
};
