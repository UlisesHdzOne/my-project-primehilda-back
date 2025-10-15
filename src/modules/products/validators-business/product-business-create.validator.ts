import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';
import { ProductRules } from './rules/product.rules';

export const ProductBusinessValidatorCreate = {
  validar: async (dto: CreateProductDto, prisma: PrismaService) => {
    const errors: ApiError[] = [];

    // 1. Validación de Nombre
    if (!ProductRules.isValidName(dto.name)) {
      errors.push({
        field: 'name',
        message: 'El nombre es obligatorio y debe tener al menos 3 caracteres.',
      });
    }
    if (!(await ProductRules.isNameUnique(dto.name, prisma))) {
      errors.push({
        field: 'name',
        message: 'Ya existe un producto con este nombre.',
      });
    }

    // 2. Validación de Precio
    if (!ProductRules.isValidPrice(dto.price)) {
      errors.push({ field: 'price', message: 'El precio debe ser mayor a 0.' });
    }

    // 3. Validación de Categoría
    if (!ProductRules.isValidCategory(dto.category)) {
      errors.push({
        field: 'category',
        message: `La categoría "${dto.category}" no es válida.`,
      });
    }

    // 4. Validación de Opciones Gratis (FreeOptions)
    // 🟢 ESTA SECCIÓN ES LA QUE UTILIZA LAS REGLAS RECIÉN MODIFICADAS
    if (dto.freeOptions && dto.freeOptions.length > 0) {
      const freeValidation = ProductRules.isValidFreeOptions(dto.freeOptions);

      if (!freeValidation.valid && freeValidation.errors) {
        // Mapea los errores de la función de reglas a la estructura ApiError
        freeValidation.errors.forEach((msg, i) =>
          errors.push({ field: `freeOptions[${i}]`, message: msg }),
        );
      }
    }

    // 5. Lanzar excepción si hay errores
    if (errors.length > 0) {
      ErrorHelper.badRequestException('Validation failed', errors);
    }
  },
};
