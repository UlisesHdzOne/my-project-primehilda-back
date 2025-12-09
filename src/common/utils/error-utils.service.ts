import { Injectable } from '@nestjs/common';
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

      // Detectar errores de Prisma / DB
      if (error instanceof Error) {
        const isPrismaError =
          error.constructor.name.includes('Prisma') ||
          error.message.toLowerCase().includes('prisma') ||
          error.message.toLowerCase().includes('database');

        if (isPrismaError) {
          throw new DatabaseError(operation, error);
        }
      }

      // Otros errores inesperados
      throw error;
    }
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
}
