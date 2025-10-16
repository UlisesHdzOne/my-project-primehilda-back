// src/modules/products/services/product.validator.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductType } from 'src/common/constants/product-types.enum';
import { OrderType } from 'src/common/constants/order-type.enum';
import { FreeOptionDto } from '../dto/free-option.dto';
import { PRODUCT_MESSAGES } from 'src/common/constants';

@Injectable()
export class ProductValidator {
  constructor(private readonly prisma: PrismaService) {}

  // --- Validación de Existencia ---

  /**
   * Valida que el producto existe. Lanza NotFoundException si no existe.
   */
  async validateExists(id: number): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(
        PRODUCT_MESSAGES.productoNoEncontrado || 'Producto no encontrado',
      );
    }
  }

  // --- Validación para CREATE ---

  async validateCreate(dto: CreateProductDto): Promise<void> {
    const errors: string[] = [];

    // 1. Unicidad del nombre
    if (!(await this.isNameUnique(dto.name))) {
      errors.push(
        PRODUCT_MESSAGES.nombreDuplicado ||
          'Ya existe un producto con este nombre.',
      );
    }

    // 2. Validación de Opciones Gratis (FreeOptions)
    if (dto.freeOptions && dto.freeOptions.length > 0) {
      const freeValidation = this.isValidFreeOptions(dto.freeOptions);
      if (freeValidation.errors) {
        errors.push(...freeValidation.errors);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors); // ✅ Lanzar array de strings
    }
  }

  // --- Validación para UPDATE ---

  async validateUpdate(id: number, dto: UpdateProductDto): Promise<void> {
    await this.validateExists(id); // 1. Verificar existencia

    const errors: string[] = [];

    // 2. Unicidad del nombre (excluyendo el producto actual)
    if (dto.name && !(await this.isNameUnique(dto.name, id))) {
      errors.push(
        PRODUCT_MESSAGES.nombreDuplicado ||
          'Ya existe otro producto con este nombre.',
      );
    }

    // 3. Validación de Opciones Gratis (FreeOptions)
    // Solo si el array es proporcionado en la actualización
    if (dto.freeOptions) {
      const freeValidation = this.isValidFreeOptions(dto.freeOptions);
      if (freeValidation.errors) {
        errors.push(...freeValidation.errors);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors); // ✅ Lanzar array de strings
    }
  }

  // --- Métodos Auxiliares (Antiguas ProductRules) ---

  private async isNameUnique(
    name: string,
    productId?: number,
  ): Promise<boolean> {
    const existing = await this.prisma.product.findFirst({
      where: productId ? { name, NOT: { id: productId } } : { name },
    });
    return !existing;
  }

  private isValidFreeOptions(freeOptions: FreeOptionDto[]): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];
    const VALID_PRODUCT_TYPES: Set<string> = new Set(
      Object.values(ProductType),
    );
    const VALID_ORDER_TYPES: Set<string> = new Set(Object.values(OrderType));

    let totalQuantity = 0;
    const uniqueOptions = new Set<string>();

    freeOptions.forEach((opt, i) => {
      // Validación de Categoría y Tipo de Orden (Ya cubierto por class-validator, pero re-validamos reglas de negocio)
      if (!VALID_PRODUCT_TYPES.has(opt.category)) {
        errors.push(
          `freeOptions[${i}]: Categoría '${opt.category}' no es válida.`,
        );
      }

      if (!VALID_ORDER_TYPES.has(opt.orderType)) {
        errors.push(
          `freeOptions[${i}]: Tipo de orden '${opt.orderType}' no es válido.`,
        );
      }

      // Validación de Duplicados (Categoría, Tipo de Orden)
      const key = `${opt.category}:${opt.orderType}`;
      if (uniqueOptions.has(key)) {
        errors.push(
          `freeOptions[${i}]: Opción duplicada para Categoría '${opt.category}' y Tipo '${opt.orderType}'.`,
        );
      }
      uniqueOptions.add(key);

      // Total de Cantidad
      totalQuantity += opt.quantity;
    });

    if (totalQuantity > 10)
      errors.push('La cantidad total de productos gratis no puede exceder 10.');

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
