export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;
  public abstract readonly isOperational: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    // CORREGIDO: Usar verificación directa
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }

  public abstract serializeErrors(): Array<{ message: string; field?: string }>;
}
export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly code = 'NOT_FOUND';
  public readonly isOperational = true;

  constructor(
    public readonly resource: string,
    public readonly id?: string | number,
  ) {
    const idStr = id ? ` con ID ${String(id)}` : '';
    super(`${resource}${idStr} no encontrado.`);
  }

  public serializeErrors() {
    return [{ message: this.message }];
  }
}

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

export class ConflictError extends AppError {
  public readonly statusCode = 409;
  public readonly code = 'CONFLICT';
  public readonly isOperational = true;

  constructor(
    public readonly resourceName: string,
    public readonly conflictField: string,
  ) {
    super(`Ya existe un ${resourceName} con la misma ${conflictField}`);
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

export class DatabaseError extends AppError {
  public readonly statusCode = 500;
  public readonly code = 'DATABASE_ERROR';
  public readonly isOperational = false;

  constructor(
    operation: string,
    originalError: Error & { code?: string },
    public readonly prismaErrorCode?: string,
  ) {
    super(`Error en operación de base de datos: ${operation}`);

    if (!this.prismaErrorCode && originalError.code?.startsWith('P')) {
      this.prismaErrorCode = originalError.code;
    }

    if (this.prismaErrorCode) {
      this.message = `${this.message} (Código: ${this.prismaErrorCode})`;
    }

    if (originalError.stack) {
      this.stack = originalError.stack;
    }
  }

  public serializeErrors() {
    const baseError = { message: 'Error interno del servidor' };

    if (process.env.NODE_ENV === 'development' && this.prismaErrorCode) {
      const operation = this.message.split(': ')[1]?.replace(/ \(Código: P\d+\)/, '') ?? 'unknown';
      return [
        {
          ...baseError,
          metadata: {
            prismaErrorCode: this.prismaErrorCode,
            operation,
          },
        },
      ];
    }

    return [baseError];
  }
}

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
