// src/categories/validators/category-business.validator.ts - MEJORADO
import { Injectable } from '@nestjs/common';
import { AppLogger } from '@/core/logger/winston.config';
import { BusinessRuleError, ValidationError } from '@/core/errors/custom.errors';
import { Product } from '@prisma/client';
import { ConfigService } from '@nestjs/config'; // ✅ NUEVO

export type ProductBasic = Pick<Product, 'id' | 'name'>;

@Injectable()
export class CategoryBusinessValidator {
  private readonly reservedWords: string[];

  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService, // ✅ NUEVO
  ) {
    // ✅ USAR ConfigService para configuración
    this.reservedWords = this.configService.get<string[]>('app.categories.reservedWords') || [
      'admin',
      'system',
      'root',
      'test',
      'default',
    ];

    this.logger.debug('CategoryBusinessValidator inicializado', {
      reservedWords: this.reservedWords,
    });
  }

  // ✅ REGLAS DE NEGOCIO MEJORADAS
  validateNameRules(name: string): void {
    const errors: Array<{ field: string; message: string }> = [];

    // Validar longitud
    if (name.trim().length !== name.length) {
      errors.push({ field: 'name', message: 'No puede empezar o terminar con espacios' });
    }

    // Validar caracteres permitidos
    const invalidChars = name.match(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g);
    if (invalidChars) {
      errors.push({
        field: 'name',
        message: `Caracteres no permitidos: ${invalidChars.join(', ')}`,
      });
    }

    // Validar palabras reservadas
    if (this.reservedWords.includes(name.toLowerCase())) {
      errors.push({
        field: 'name',
        message: `"${name}" está reservado. Palabras reservadas: ${this.reservedWords.join(', ')}`,
      });
    }

    // Validar formato (primer carácter debe ser letra)
    if (!/^[a-zA-ZÁÉÍÓÚáéíóú]/.test(name)) {
      errors.push({
        field: 'name',
        message: 'El nombre debe comenzar con una letra',
      });
    }

    // Log de advertencia para nombres sospechosos
    if (name.length < 4) {
      this.logger.warn('Nombre de categoría muy corto', { name });
    }

    if (errors.length > 0) {
      this.logger.warn('Validación de nombre falló', { name, errors });
      throw new ValidationError(errors);
    }

    this.logger.debug('Nombre de categoría validado exitosamente', { name });
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
          productNames: productNames.slice(0, 5), // Limitar para no saturar logs
          suggestion: 'Elimine o reasigne los productos primero',
        },
      );
    }

    this.logger.debug('Validación de eliminación exitosa - categoría sin productos');
  }

  // ✅ NUEVO: Validar para operaciones masivas
  validateForBulkOperation(categoriesCount: number): void {
    const maxBulkOperation =
      this.configService.get<number>('app.categories.maxBulkOperation') || 50;

    if (categoriesCount > maxBulkOperation) {
      throw new BusinessRuleError(
        'BULK_OPERATION_LIMIT',
        `No se pueden procesar más de ${maxBulkOperation} categorías a la vez`,
        {
          maxAllowed: maxBulkOperation,
          attempted: categoriesCount,
        },
      );
    }

    this.logger.debug('Validación de operación masiva exitosa', {
      categoriesCount,
      maxAllowed: maxBulkOperation,
    });
  }

  // ✅ NUEVO: Validar nombre duplicado (para uso antes de consultas)
  validatePotentialDuplicate(newName: string, existingNames: string[]): void {
    const normalizedNewName = newName.toLowerCase().trim();

    for (const existingName of existingNames) {
      if (existingName.toLowerCase().trim() === normalizedNewName) {
        this.logger.warn('Posible duplicado detectado', {
          newName,
          existingName,
        });

        throw new BusinessRuleError(
          'POTENTIAL_DUPLICATE',
          'Este nombre es muy similar a uno existente',
          {
            newName,
            similarTo: existingName,
            suggestion: 'Use un nombre más distintivo',
          },
        );
      }
    }
  }
}
