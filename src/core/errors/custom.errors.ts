// src/core/errors/custom.errors.ts - VERSIÓN COMPLETA
export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;
  public abstract readonly isOperational: boolean;

  constructor(message: string) {
    super(message);

    // ✅ CRÍTICO: Esto es esencial para que instanceof funcione
    Object.setPrototypeOf(this, new.target.prototype);

    // ✅ Mantener el stack trace
    Error.captureStackTrace?.(this, this.constructor);

    // ✅ Nombre correcto
    this.name = this.constructor.name;
  }

  public abstract serializeErrors(): Array<{ message: string; field?: string }>;
}

// ========== NOT FOUND ERROR ==========
export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly code = 'NOT_FOUND';
  public readonly isOperational = true;

  constructor(
    public readonly resource: string,
    public readonly id?: string | number,
  ) {
    super(`${resource}${id ? ` con ID ${id}` : ''} no encontrado.`);
  }

  public serializeErrors() {
    return [{ message: this.message }];
  }
}

// ========== VALIDATION ERROR ==========
export class ValidationError extends AppError {
  public readonly statusCode = 400;
  public readonly code = 'VALIDATION_ERROR';
  public readonly isOperational = true;

  constructor(public errors: Array<{ field: string; message: string }>) {
    super('Error de validación');
  }

  public serializeErrors() {
    return this.errors;
  }
}

// ========== UNAUTHORIZED ERROR ==========
export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
  public readonly code = 'UNAUTHORIZED';
  public readonly isOperational = true;

  constructor(message = 'No autorizado') {
    super(message);
  }

  public serializeErrors() {
    return [{ message: this.message }];
  }
}

// ========== FORBIDDEN ERROR ==========
export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
  public readonly code = 'FORBIDDEN';
  public readonly isOperational = true;

  constructor(message = 'Acceso denegado') {
    super(message);
  }

  public serializeErrors() {
    return [{ message: this.message }];
  }
}

// ========== CONFLICT ERROR ==========
export class ConflictError extends AppError {
  public readonly statusCode = 409;
  public readonly code = 'CONFLICT';
  public readonly isOperational = true;

  constructor(
    public readonly resourceName: string,
    public readonly conflictField: string,
  ) {
    super(`${resourceName} con ${conflictField} ya existe`);
  }

  public serializeErrors() {
    return [
      {
        field: this.conflictField,
        message: this.message,
      },
    ];
  }
}

// ========== DATABASE ERROR ==========
export class DatabaseError extends AppError {
  public readonly statusCode = 500;
  public readonly code = 'DATABASE_ERROR';
  public readonly isOperational = false;

  constructor(operation: string, originalError: Error) {
    super(`Error en operación de base de datos: ${operation}`);
    if (originalError.stack) {
      this.stack = originalError.stack;
    }
  }

  public serializeErrors() {
    return [{ message: 'Error interno del servidor' }];
  }
}

// ========== BUSINESS RULE ERROR ==========
export class BusinessRuleError extends AppError {
  public readonly statusCode = 422;
  public readonly isOperational = true;

  constructor(
    public readonly code: string,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
  }

  public serializeErrors() {
    const error = {
      message: this.message,
      code: this.code,
    };

    if (this.metadata && process.env.NODE_ENV === 'development') {
      return [{ ...error, metadata: this.metadata }];
    }

    return [error];
  }
}
