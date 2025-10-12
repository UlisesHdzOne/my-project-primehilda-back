import { PrismaService } from 'src/prisma/prisma.service';
import { ProductType } from 'src/common/constants/product-types.enum';

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
    return price != null && price > 0;
  },

  isValidCategory(category: string): boolean {
    return Object.values(ProductType).includes(category as ProductType);
  },

  isValidFreeOptions(
    freeOptions: Array<{ category: ProductType; quantity: number }>,
  ): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (!freeOptions) return { valid: true };

    let total = 0;
    freeOptions.forEach((opt, i) => {
      if (!Object.values(ProductType).includes(opt.category)) {
        errors.push(
          `La categoría de freeOption en posición ${i} no es válida.`,
        );
      }
      if (opt.quantity <= 0) {
        errors.push(
          `La cantidad de freeOption en posición ${i} debe ser mayor a 0.`,
        );
      }
      total += opt.quantity;
    });

    if (total > 10)
      errors.push('La cantidad total de productos gratis no puede exceder 10.');

    return { valid: errors.length === 0, errors };
  },
};
