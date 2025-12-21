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
  /**
   * Wrapper para manejar errores de base de datos de forma centralizada
   * @param operation Nombre de la operación (para logging)
   * @param callback Función async que ejecuta la operación
   * @returns Resultado de la operación o lanza error apropiado
   */
  async withDatabaseErrorHandling<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      // ✅ Transformar error en AppError apropiado
      throw this.transformError(error, operation);
    }
  }

  /**
   * Transforma errores desconocidos en AppErrors específicos
   */
  private transformError(error: unknown, operation: string): AppError | Error {
    // 1️⃣ Si ya es un AppError, retornar tal cual
    if (error instanceof AppError) {
      return error;
    }

    // 2️⃣ Si es error de Prisma, transformar según código
    if (this.isPrismaError(error)) {
      return this.handlePrismaError(error, operation);
    }

    // 3️⃣ Si es Error genérico, retornar tal cual
    if (error instanceof Error) {
      return error;
    }

    // 4️⃣ Valor desconocido
    return new Error(`Error desconocido: ${String(error)}`);
  }

  /**
   * Maneja errores específicos de Prisma según su código
   */
  private handlePrismaError(error: PrismaErrorWithCode, operation: string): AppError {
    const errorCode = this.extractPrismaErrorCode(error);

    switch (errorCode) {
      case 'P2002': {
        // Unique constraint violation
        const field = this.extractFieldFromPrismaError(error);
        return new ConflictError('Recurso', field || 'campo único');
      }

      case 'P2025': {
        // Record not found
        return new NotFoundError('Recurso');
      }

      case 'P2003': {
        // Foreign key constraint failed
        const field = this.extractFieldFromPrismaError(error);
        return new DatabaseError(
          operation,
          new Error(`Violación de restricción de clave foránea en: ${field}`),
          errorCode,
        );
      }

      case 'P2014': {
        // Required relation violation
        const field = this.extractFieldFromPrismaError(error);
        return new DatabaseError(
          operation,
          new Error(`Relación requerida faltante: ${field}`),
          errorCode,
        );
      }

      case 'P2015': {
        // Related record not found
        return new NotFoundError('Registro relacionado');
      }

      default: {
        // Otros errores de Prisma
        return new DatabaseError(operation, error, errorCode);
      }
    }
  }

  // ==================== TYPE GUARDS ====================

  /**
   * Verifica si un error es de Prisma
   */
  private isPrismaError(error: unknown): error is PrismaErrorWithCode {
    // 1. Verificar instancias específicas de Prisma
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      return true;
    }

    // 2. Verificar por código de error (P2xxx)
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

  /**
   * Type guard para verificar si un objeto tiene código de error de Prisma
   */
  private hasErrorCode(error: unknown): error is PrismaErrorWithCode {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const errorObj = error as Record<string, unknown>;

    return (
      'code' in errorObj &&
      typeof errorObj.code === 'string' &&
      errorObj.code.startsWith('P') &&
      /^P\d{4}$/.test(errorObj.code) // Formato P2xxx
    );
  }

  // ==================== HELPERS PÚBLICOS ====================

  /**
   * Valida que una entidad exista, lanza NotFoundError si es null
   */
  validateEntityExists<T>(entity: T | null, entityName: string, id?: string | number): T {
    if (!entity) {
      throw new NotFoundError(entityName, id);
    }
    return entity;
  }

  /**
   * Verifica conflictos de unicidad, lanza ConflictError si existe
   */
  checkConflict<T>(entity: T | null, entityName: string, fieldName: string): void {
    if (entity) {
      throw new ConflictError(entityName, fieldName);
    }
  }

  /**
   * Valida que una entidad exista de forma async
   */
  async validateEntityExistsAsync<T>(
    entityPromise: Promise<T | null>,
    entityName: string,
    id?: string | number,
  ): Promise<T> {
    const entity = await entityPromise;
    return this.validateEntityExists(entity, entityName, id);
  }

  /**
   * Valida múltiples entidades
   */
  validateEntitiesExist<T>(
    entities: (T | null)[],
    entityName: string,
    ids?: (string | number)[],
  ): T[] {
    const validEntities: T[] = [];

    entities.forEach((entity, index) => {
      const id = ids?.[index];
      validEntities.push(this.validateEntityExists(entity, entityName, id));
    });

    return validEntities;
  }

  // ==================== EXTRACCIÓN DE INFORMACIÓN ====================

  /**
   * Extrae el código de error de Prisma
   */
  private extractPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }

    if (this.hasErrorCode(error)) {
      return error.code;
    }

    return undefined;
  }

  /**
   * Extrae el nombre del campo del error de Prisma
   */
  private extractFieldFromPrismaError(error: PrismaErrorWithCode): string {
    // 1. Intentar extraer de meta.target (más confiable)
    if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.length > 0) {
      return this.cleanFieldName(error.meta.target[0]);
    }

    // 2. Intentar extraer de meta.field_name
    if (error.meta?.field_name) {
      return this.cleanFieldName(error.meta.field_name);
    }

    // 3. Parsear mensaje de error
    if (error.message) {
      const extractedField = this.extractFieldFromMessage(error.message);
      if (extractedField) {
        return extractedField;
      }
    }

    return 'campo';
  }

  /**
   * Extrae campo del mensaje de error usando patrones
   */
  private extractFieldFromMessage(message: string): string | null {
    const patterns = [
      /fields: \(`([^`]+)`\)/, // "fields: (`email`)"
      /field: `([^`]+)`/, // "field: `email`"
      /constraint "([^"]+)_key"/, // "constraint "users_email_key""
      /Key \(([^)]+)\)/, // "Key (email)"
      /column "([^"]+)"/, // "column "email""
      /Foreign key constraint failed on the field: `([^`]+)`/, // FK específico
      /Unique constraint failed on the fields: \(`([^`]+)`\)/, // Unique específico
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match?.[1]) {
        return this.cleanFieldName(match[1]);
      }
    }

    return null;
  }

  /**
   * Limpia el nombre del campo extraído
   */
  private cleanFieldName(field: string): string {
    return field
      .replace(/^.*_/, '') // Remover prefijo de tabla
      .replace(/_key$/, '') // Remover sufijo _key
      .replace(/`/g, '') // Remover backticks
      .replace(/"/g, '') // Remover comillas
      .trim();
  }

  // ==================== HELPERS DE DIAGNÓSTICO ====================

  /**
   * Obtiene información detallada del error (útil para debugging)
   */
  getErrorInfo(error: unknown): {
    type: string;
    message: string;
    code?: string;
    isPrisma: boolean;
    isOperational: boolean;
  } {
    if (error instanceof AppError) {
      return {
        type: error.constructor.name,
        message: error.message,
        code: error.code,
        isPrisma: false,
        isOperational: error.isOperational,
      };
    }

    if (this.isPrismaError(error)) {
      return {
        type: 'PrismaError',
        message: error.message,
        code: this.extractPrismaErrorCode(error),
        isPrisma: true,
        isOperational: false,
      };
    }

    if (error instanceof Error) {
      return {
        type: error.constructor.name,
        message: error.message,
        isPrisma: false,
        isOperational: false,
      };
    }

    return {
      type: 'Unknown',
      message: String(error),
      isPrisma: false,
      isOperational: false,
    };
  }
}
