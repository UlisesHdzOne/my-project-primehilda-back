import { DatabaseError, NotFoundError, ConflictError } from '@/core/errors/custom.errors';

export async function withDatabaseErrorHandling<T>(
  operation: string,
  callback: () => Promise<T>,
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof Error) {
      // Detectar errores de Prisma
      const isPrismaError =
        error.constructor.name.includes('Prisma') ||
        error.message.toLowerCase().includes('prisma') ||
        error.message.toLowerCase().includes('database');

      if (isPrismaError) {
        throw new DatabaseError(operation, error);
      }
    }
    throw error;
  }
}

export function validateOrThrow<T>(entity: T | null, entityName: string, id?: string | number): T {
  if (!entity) {
    throw new NotFoundError(entityName, id);
  }
  return entity;
}

export function checkConflict<T>(entity: T | null, entityName: string, fieldName: string): void {
  if (entity) {
    throw new ConflictError(entityName, fieldName);
  }
}
