import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductType } from 'src/common/constants/product-types.enum';

export const ProductBusinessValidatorCreate = {
  validar: async (dto: CreateProductDto, prisma: PrismaService) => {
    const errors: string[] = [];

    // Nombre obligatorio
    if (!dto.name || dto.name.trim().length < 3) {
      errors.push(
        'El nombre es obligatorio y debe tener al menos 3 caracteres.',
      );
    }

    // Nombre único
    const existing = await prisma.product.findFirst({
      where: { name: dto.name },
    });
    if (existing) errors.push('Ya existe un producto con este nombre.');

    // Precio válido
    if (dto.price == null || dto.price <= 0) {
      errors.push('El precio debe ser mayor a 0.');
    }

    // Categoría válida
    if (!Object.values(ProductType).includes(dto.category)) {
      errors.push(`La categoría "${dto.category}" no es válida.`);
    }

    // Validación de freeOptions
    if (dto.freeOptions) {
      let total = 0;
      dto.freeOptions.forEach((opt, i) => {
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
        errors.push(
          'La cantidad total de productos gratis no puede exceder 10.',
        );
    }

    if (errors.length) throwBadRequest(errors);
  },
};
