import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import {
  DatabaseError,
  NotFoundError,
  ConflictError,
  AppError,
} from '../../core/errors/custom.errors';

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
      throw this.transformError(error, operation);
    }
  }

  private transformError(error: unknown, operation: string): AppError | Error {
    if (error instanceof AppError) {
      return error;
    }

    if (this.isPrismaError(error)) {
      return this.handlePrismaError(error, operation);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(`Error desconocido: ${String(error)}`);
  }

  private handlePrismaError(error: PrismaErrorWithCode, operation: string): AppError {
    const errorCode = this.extractPrismaErrorCode(error);

    switch (errorCode) {
      case 'P2002': {
        const field = this.extractFieldFromPrismaError(error);

        return new ConflictError('Recurso', field || 'campo único');
      }

      case 'P2025': {
        return new NotFoundError('Recurso');
      }

      case 'P2003': {
        const field = this.extractFieldFromPrismaError(error);

        return new DatabaseError(
          operation,

          new Error(`Violación de restricción de clave foránea en: ${field}`),

          errorCode,
        );
      }

      case 'P2014': {
        const field = this.extractFieldFromPrismaError(error);

        return new DatabaseError(
          operation,

          new Error(`Relación requerida faltante: ${field}`),

          errorCode,
        );
      }

      case 'P2015': {
        return new NotFoundError('Registro relacionado');
      }

      default: {
        return new DatabaseError(operation, error, errorCode);
      }
    }
  }

  private isPrismaError(error: unknown): error is PrismaErrorWithCode {
    if (error instanceof Error) {
      const constructorName = error.constructor.name;

      if (constructorName.includes('PrismaClient')) {
        return true;
      }

      if (this.hasErrorCode(error)) {
        return true;
      }
    }

    return false;
  }

  private hasErrorCode(error: unknown): error is PrismaErrorWithCode {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const errorObj = error as Record<string, unknown>;

    return (
      'code' in errorObj &&
      typeof errorObj.code === 'string' &&
      errorObj.code.startsWith('P') &&
      /^P\d{4}$/.test(errorObj.code)
    );
  }

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

  async validateEntityExistsAsync<T>(
    entityPromise: Promise<T | null>,

    entityName: string,

    id?: string | number,
  ): Promise<T> {
    const entity = await entityPromise;

    return this.validateEntityExists(entity, entityName, id);
  }

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

  private extractPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }

    if (this.hasErrorCode(error)) {
      return error.code;
    }

    return undefined;
  }

  private extractFieldFromPrismaError(error: PrismaErrorWithCode): string {
    if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.length > 0) {
      return this.cleanFieldName(error.meta.target[0]);
    }

    if (error.meta?.field_name) {
      return this.cleanFieldName(error.meta.field_name);
    }

    if (error.message) {
      const extractedField = this.extractFieldFromMessage(error.message);

      if (extractedField) {
        return extractedField;
      }
    }

    return 'campo';
  }

  private extractFieldFromMessage(message: string): string | null {
    const patterns = [
      /fields: \(`([^`]+)`\)/,

      /field: `([^`]+)`/,

      /constraint "([^"]+)_key"/,

      /Key \(([^)]+)\)/,

      /column "([^"]+)"/,

      /Foreign key constraint failed on the field: `([^`]+)`/,

      /Unique constraint failed on the fields: \(`([^`]+)`\)/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);

      if (match?.[1]) {
        return this.cleanFieldName(match[1]);
      }
    }

    return null;
  }

  private cleanFieldName(field: string): string {
    return field

      .replace(/^.*_/, '')

      .replace(/_key$/, '')

      .replace(/`/g, '')

      .replace(/"/g, '')

      .trim();
  }

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
