import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DatabaseError,
  NotFoundError,
  ConflictError,
  AppError,
} from '../../core/errors/custom.errors';

/**
 * Metadata de errores de Prisma (type-safe).
 */
interface PrismaErrorMeta {
  readonly target?: readonly string[];
  readonly field_name?: string;
  readonly modelName?: string;
  readonly [key: string]: unknown;
}

/**
 * Type guard para verificar si un objeto tiene la estructura de meta de Prisma.
 */
function hasPrismaMeta(obj: unknown): obj is { meta?: PrismaErrorMeta } {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'meta' in obj &&
    (obj.meta === undefined || typeof obj.meta === 'object')
  );
}

/**
 * Type guard mejorado para PrismaClientKnownRequestError.
 * Verifica la estructura exacta del error sin usar 'as any'.
 *
 * @param error - Error desconocido a verificar
 * @returns true si es un error conocido de Prisma
 */
export function isPrismaKnownRequestError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.constructor.name !== 'PrismaClientKnownRequestError') {
    return false;
  }

  const hasCode =
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string' &&
    /^P\d{4}$/.test((error as { code: string }).code);

  if (!hasCode) {
    return false;
  }

  return !('meta' in error) || hasPrismaMeta(error);
}

/**
 * Type guard para cualquier error de Prisma (genérico).
 */
export function isPrismaClientError(error: unknown): error is Error & { code?: string } {
  if (!(error instanceof Error)) {
    return false;
  }

  const constructorName = error.constructor.name;

  return (
    constructorName.startsWith('PrismaClient') ||
    constructorName.includes('Prisma') ||
    ('code' in error &&
      typeof (error as { code?: unknown }).code === 'string' &&
      (error as { code: string }).code.startsWith('P'))
  );
}

/**
 * Servicio utilitario para manejo de errores de base de datos.
 * Centraliza la transformación de errores de Prisma a errores de aplicación.
 */
@Injectable()
export class ErrorUtilsService {
  /**
   * Ejecuta una operación de BD con manejo automático de errores.
   *
   * @example
   * await errorUtils.withDatabaseErrorHandling('findCar', async () => {
   *   return await prisma.car.findUnique({ where: { id } });
   * });
   *
   * @param operation - Nombre de la operación (para logging)
   * @param callback - Función async a ejecutar
   * @returns Resultado de la operación
   * @throws AppError si ocurre un error
   */
  async withDatabaseErrorHandling<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * Transforma errores desconocidos en AppErrors tipados.
   */
  private transformError(error: unknown, operation: string): AppError | Error {
    if (error instanceof AppError) {
      return error;
    }

    if (isPrismaKnownRequestError(error)) {
      return this.handlePrismaKnownRequestError(error, operation);
    }

    if (isPrismaClientError(error)) {
      return new DatabaseError(operation, error, error.code);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(`Error desconocido: ${String(error)}`);
  }

  /**
   * Maneja errores conocidos de Prisma con códigos específicos.
   * Usa exhaustive checking para cubrir todos los casos.
   */
  private handlePrismaKnownRequestError(
    error: Prisma.PrismaClientKnownRequestError,
    operation: string,
  ): AppError {
    const { code, meta } = error;

    switch (code) {
      case 'P2002': {
        const field = this.extractFieldFromMeta(meta as PrismaErrorMeta | undefined);
        return new ConflictError('Recurso', field);
      }

      case 'P2025': {
        return new NotFoundError('Recurso');
      }

      case 'P2003': {
        const field = this.extractFieldFromMeta(meta as PrismaErrorMeta | undefined);
        return new DatabaseError(
          operation,
          new Error(`Violación de restricción de clave foránea en: ${field}`),
          code,
        );
      }

      case 'P2014': {
        const field = this.extractFieldFromMeta(meta as PrismaErrorMeta | undefined);
        return new DatabaseError(
          operation,
          new Error(`Relación requerida faltante: ${field}`),
          code,
        );
      }

      case 'P2015': {
        return new NotFoundError('Registro relacionado');
      }

      default: {
        return new DatabaseError(operation, error, code);
      }
    }
  }

  /**
   * Valida que una entidad existe, lanza NotFoundError si es null.
   *
   * @example
   * const car = errorUtils.validateEntityExists(
   *   await prisma.car.findUnique({ where: { id } }),
   *   'Car',
   *   id
   * );
   */
  validateEntityExists<T>(entity: T | null, entityName: string, id?: string | number): T {
    if (entity === null || entity === undefined) {
      throw new NotFoundError(entityName, id);
    }
    return entity;
  }

  /**
   * Verifica que una entidad NO existe, lanza ConflictError si existe.
   * Útil para validaciones de unicidad.
   */
  checkConflict<T>(entity: T | null, entityName: string, fieldName: string): void {
    if (entity !== null && entity !== undefined) {
      throw new ConflictError(entityName, fieldName);
    }
  }

  /**
   * Versión async de validateEntityExists.
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
   * Valida múltiples entidades en batch.
   */
  validateEntitiesExist<T>(
    entities: Array<T | null>,
    entityName: string,
    ids?: Array<string | number>,
  ): T[] {
    return entities.map((entity, index) => {
      const id = ids?.[index];
      return this.validateEntityExists(entity, entityName, id);
    });
  }

  /**
   * Extrae el nombre del campo desde meta de Prisma.
   * Soporta múltiples formatos de metadata.
   */
  private extractFieldFromMeta(meta?: PrismaErrorMeta): string {
    if (!meta) {
      return 'campo';
    }

    if (meta.target && Array.isArray(meta.target) && meta.target.length > 0) {
      const firstTarget = meta.target[0];
      if (firstTarget !== undefined) {
        return this.cleanFieldName(firstTarget); // ¡QUITA String() aquí!
      }
    }

    if (meta.field_name && typeof meta.field_name === 'string') {
      return this.cleanFieldName(meta.field_name);
    }

    return 'campo';
  }

  /**
   * Limpia el nombre del campo removiendo prefijos/sufijos técnicos.
   */
  private cleanFieldName(field: string): string {
    return field.replace(/^.*_/, '').replace(/_key$/, '').replace(/[`"]/g, '').trim();
  }

  /**
   * Obtiene información detallada de un error (para debugging).
   */
  getErrorInfo(error: unknown): {
    readonly type: string;
    readonly message: string;
    readonly code?: string;
    readonly isPrisma: boolean;
    readonly isOperational: boolean;
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

    if (isPrismaKnownRequestError(error)) {
      return {
        type: 'PrismaClientKnownRequestError',
        message: error.message,
        code: error.code,
        isPrisma: true,
        isOperational: false,
      };
    }

    if (isPrismaClientError(error)) {
      return {
        type: 'PrismaClientError',
        message: error.message,
        code: error.code,
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
