import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DatabaseError,
  NotFoundError,
  ConflictError,
  AppError,
} from '../../core/errors/custom.errors';

// ==================== TIPOS SEGUROS ====================
interface PrismaErrorWithCode extends Error {
  code?: string;
  meta?: {
    target?: string[];
    field_name?: string;
    modelName?: string;
  };
}

@Injectable()
export class ErrorUtilsService {
  async withDatabaseErrorHandling<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      // ✅ PRIMERO: Verificar errores de Prisma ANTES de AppError
      if (this.isPrismaError(error)) {
        const prismaError = error as PrismaErrorWithCode;
        const errorCode = this.extractPrismaErrorCode(error);

        // P2002 - Unique constraint violation
        if (errorCode === 'P2002') {
          const field = this.extractFieldFromPrismaError(prismaError);
          throw new ConflictError('Recurso', field || 'campo único');
        }

        // P2025 - Record not found
        if (errorCode === 'P2025') {
          throw new NotFoundError('Recurso');
        }

        // P2003 - Foreign key constraint failed
        if (errorCode === 'P2003') {
          const field = this.extractFieldFromPrismaError(prismaError);
          throw new DatabaseError(
            operation,
            new Error(`Violación de restricción de clave foránea en: ${field}`),
            errorCode,
          );
        }

        // Otros errores de Prisma
        throw new DatabaseError(operation, prismaError, errorCode);
      }

      // ✅ SEGUNDO: Si ya es un AppError procesado, relanzar
      if (error instanceof AppError) {
        throw error;
      }

      // ✅ TERCERO: Errores inesperados
      if (error instanceof Error) {
        throw error;
      }

      // ✅ CUARTO: Valor desconocido
      throw new Error(`Error desconocido: ${String(error)}`);
    }
  }

  // ==================== VALIDACIÓN MEJORADA ====================
  private isPrismaError(error: unknown): error is PrismaErrorWithCode {
    // 1. Verificar instancias específicas
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      return true;
    }

    // 2. Verificar por código de error
    if (this.hasErrorCode(error)) {
      return true;
    }

    // 3. Verificar por constructor name
    if (error instanceof Error) {
      const constructorName = error.constructor.name;
      return constructorName.includes('PrismaClient');
    }

    return false;
  }

  // Helper type guard para verificar código
  private hasErrorCode(error: unknown): error is PrismaErrorWithCode {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const errorObj = error as Record<string, unknown>;

    return 'code' in errorObj && typeof errorObj.code === 'string' && errorObj.code.startsWith('P');
  }

  // ==================== HELPERS PÚBLICOS ====================
  validateEntityExists<T>(entity: T | null, entityName: string, id?: string | number): T {
    if (!entity) {
      throw new NotFoundError(entityName, id);
    }
    return entity;
  }

  checkConflict<T>(entity: T | null, entityName: string, fieldName: string): void {
    if (entity) {
      throw new ConflictError(entityName, fieldName);
    }
  }

  // ==================== EXTRACCIÓN DE INFORMACIÓN ====================
  private extractPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }

    if (this.hasErrorCode(error)) {
      return (error as PrismaErrorWithCode).code;
    }

    return undefined;
  }

  private extractFieldFromPrismaError(error: PrismaErrorWithCode): string {
    // 1. Intentar extraer de meta.target (más confiable)
    if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.length > 0) {
      return error.meta.target[0];
    }

    // 2. Intentar extraer de meta.field_name
    if (error.meta?.field_name) {
      return error.meta.field_name;
    }

    // 3. Parsear mensaje de error
    if (!error.message) return 'campo';

    const patterns = [
      /fields: \(`([^`]+)`\)/, // "fields: (`email`)"
      /field: `([^`]+)`/, // "field: `email`"
      /constraint "([^"]+)_key"/, // "constraint "users_email_key""
      /Key \(([^)]+)\)/, // "Key (email)"
      /column "([^"]+)"/, // "column "email""
      /Foreign key constraint failed on the field: `([^`]+)`/, // FK específico
    ];

    for (const pattern of patterns) {
      const match = error.message.match(pattern);
      if (match && match[1]) {
        // Limpiar el nombre del campo
        return match[1]
          .replace(/^.*_/, '') // Remover prefijo de tabla
          .replace(/_key$/, '') // Remover sufijo _key
          .replace(/`/g, ''); // Remover backticks
      }
    }

    return 'campo';
  }
}
