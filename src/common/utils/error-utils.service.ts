import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DatabaseError,
  NotFoundError,
  ConflictError,
  AppError,
} from '../../core/errors/custom.errors';

@Injectable()
export class ErrorUtilsService {
  async withDatabaseErrorHandling<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      // Si ya es un AppError, relanzar tal cual
      if (error instanceof AppError) {
        throw error;
      }

      // ✅ DETECCIÓN DE ERRORES DE PRISMA
      if (this.isPrismaError(error)) {
        const prismaError = error as Error & { code?: string };
        const errorCode = this.extractPrismaErrorCode(error);

        // ✅ CORREGIDO: Mapear P2002 a ConflictError (409)
        if (errorCode === 'P2002') {
          const field = this.extractFieldFromPrismaError(prismaError);
          throw new ConflictError('Recurso', field || 'campo único');
        }

        // Otros errores de Prisma siguen siendo DatabaseError (500)
        throw new DatabaseError(operation, prismaError, errorCode);
      }

      // Otros errores inesperados
      throw error;
    }
  }

  // Método para detectar errores de Prisma
  private isPrismaError(error: unknown): boolean {
    // Verificar instancias específicas de Prisma
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      return true;
    }

    // Verificar por constructor name
    if (error instanceof Error) {
      const constructorName = error.constructor.name;
      if (
        constructorName.includes('PrismaClient') ||
        constructorName === 'PrismaClientKnownRequestError' ||
        constructorName === 'PrismaClientUnknownRequestError' ||
        constructorName === 'PrismaClientValidationError' ||
        constructorName === 'PrismaClientInitializationError' ||
        constructorName === 'PrismaClientRustPanicError'
      ) {
        return true;
      }
    }

    // Verificar mensaje de error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const prismaIndicators = [
        'prisma',
        'database',
        'unique constraint',
        'foreign key constraint',
        'null constraint',
      ];

      return prismaIndicators.some(indicator => errorMessage.includes(indicator));
    }

    return false;
  }

  // Métodos públicos helpers
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

  // Métodos privados
  private extractPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }

    if (error instanceof Error && 'code' in (error as object)) {
      const errorCode = (error as { code?: unknown }).code;
      if (typeof errorCode === 'string' && errorCode.startsWith('P')) {
        return errorCode;
      }
    }

    return undefined;
  }

  private extractFieldFromPrismaError(error: Error & { code?: string }): string {
    if (!error.message) return 'campo';

    // Extraer campo del mensaje de error P2002
    const patterns = [
      /fields: \(`([^`]+)`\)/, // "fields: (`email`)"
      /field: `([^`]+)`/, // "field: `email`"
      /constraint "([^"]+)_key"/, // "constraint "users_email_key""
      /Key \(([^)]+)\)/, // "Key (email)"
      /column "([^"]+)"/, // "column "email""
    ];

    for (const pattern of patterns) {
      const match = error.message.match(pattern);
      if (match && match[1]) {
        // Limpiar el nombre del campo
        const field = match[1];
        return field.replace(/^.*_/, '').replace(/_key$/, '');
      }
    }

    return 'campo';
  }
}
