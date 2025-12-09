// src/common/utils/error-utils.service.ts - VERSIÓN MEJORADA
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseError, NotFoundError, ConflictError, AppError } from '@/core/errors/custom.errors';

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

      // ✅ DETECCIÓN ROBUSTA DE ERRORES DE PRISMA
      if (this.isPrismaError(error)) {
        const prismaError = error as Error & { code?: string };
        const errorCode = this.extractPrismaErrorCode(error); // Necesitas extraer el código
        throw new DatabaseError(operation, prismaError, errorCode); // ✅ Pasa el código
      }

      // Otros errores inesperados
      throw error;
    }
  }

  // ✅ NUEVO: Método para detectar errores de Prisma de forma robusta
  private isPrismaError(error: unknown): boolean {
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

    // 2. Verificar por nombre de constructor (backward compatibility)
    if (error instanceof Error) {
      const constructorName = error.constructor.name;
      if (
        constructorName.includes('PrismaClient') ||
        constructorName.includes('Prisma') ||
        constructorName === 'PrismaClientKnownRequestError' ||
        constructorName === 'PrismaClientUnknownRequestError' ||
        constructorName === 'PrismaClientValidationError' ||
        constructorName === 'PrismaClientInitializationError' ||
        constructorName === 'PrismaClientRustPanicError'
      ) {
        return true;
      }
    }

    // 3. Verificar mensaje de error (último recurso)
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const prismaIndicators = [
        'prisma',
        'database',
        'unique constraint',
        'foreign key constraint',
        'null constraint',
        'violates not-null',
        'violates unique',
        'violates foreign key',
        'query execution',
        'connection',
        'pool',
        'migration',
      ];

      return prismaIndicators.some(indicator => errorMessage.includes(indicator));
    }

    return false;
  }

  // Métodos existentes (sin cambios)
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

  private extractPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }

    if (error instanceof Error && 'code' in error) {
      const errorCode = (error as any).code;
      if (typeof errorCode === 'string' && errorCode.startsWith('P')) {
        return errorCode;
      }
    }

    return undefined;
  }
}
