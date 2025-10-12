import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';
import { ProductRules } from './rules/product.rules';

export const ProductBusinessValidatorUpdate = {
  validar: async (
    dto: UpdateProductDto,
    prisma: PrismaService,
    productId: number,
  ) => {
    const errors: ApiError[] = [];

    // Nombre
    if (dto.name && !ProductRules.isValidName(dto.name)) {
      errors.push({
        field: 'name',
        message: 'El nombre debe tener al menos 3 caracteres.',
      });
    }
    if (
      dto.name &&
      !(await ProductRules.isNameUnique(dto.name, prisma, productId))
    ) {
      errors.push({
        field: 'name',
        message: 'Ya existe otro producto con este nombre.',
      });
    }

    // Precio
    if (dto.price != null && !ProductRules.isValidPrice(dto.price)) {
      errors.push({ field: 'price', message: 'El precio debe ser mayor a 0.' });
    }

    // Categoría
    if (dto.category && !ProductRules.isValidCategory(dto.category)) {
      errors.push({
        field: 'category',
        message: `La categoría "${dto.category}" no es válida.`,
      });
    }

    // FreeOptions
    if (dto.freeOptions) {
      const freeValidation = ProductRules.isValidFreeOptions(dto.freeOptions);
      if (!freeValidation.valid && freeValidation.errors) {
        freeValidation.errors.forEach((msg, i) =>
          errors.push({ field: `freeOptions[${i}]`, message: msg }),
        );
      }
    }

    if (errors.length > 0) {
      ErrorHelper.badRequestException('Validation failed', errors);
    }
  },
};
