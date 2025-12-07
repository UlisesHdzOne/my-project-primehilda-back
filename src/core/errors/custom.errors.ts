// src/core/errors/custom.errors.ts
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract isOperational: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  abstract serializeErrors(): Array<{ message: string; field?: string }>;
}

// ==============================
// Errores específicos
// ==============================

export class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;

  constructor(
    public readonly resource: string,
    public readonly id?: string | number,
  ) {
    super(`${resource}${id ? ` con ID ${id}` : ''} no encontrado.`);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;

  constructor(public errors: Array<{ field: string; message: string }>) {
    super('Error de validación');
  }

  serializeErrors() {
    return this.errors;
  }
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  isOperational = true;

  constructor(message = 'No autorizado') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  code = 'FORBIDDEN';
  isOperational = true;

  constructor(message = 'Acceso denegado') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;

  constructor(
    public readonly resourceName: string,
    public readonly conflictField: string,
  ) {
    super(`${resourceName} con ${conflictField} ya existe`);
  }

  serializeErrors() {
    return [{ field: this.conflictField, message: this.message }];
  }
}

export class DatabaseError extends AppError {
  statusCode = 500;
  code = 'DATABASE_ERROR';
  isOperational = false;

  constructor(operation: string, originalError: Error) {
    super(`Error en operación de base de datos: ${operation}`);
    this.stack = originalError.stack;
  }

  serializeErrors() {
    return [{ message: 'Error interno del servidor' }];
  }
}
