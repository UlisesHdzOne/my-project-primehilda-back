import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../../core/errors/custom.errors';
import { winstonLogger } from '../../core/logger/winston.config';

// ==================== TIPOS ====================
interface ErrorDetail {
  message: string;
  field?: string;
}

interface ErrorResponseBody {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    timestamp: string;
    path: string;
    method: string;
    statusCode: number;
  };
}

// Tipo para la respuesta de HttpException
interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  details?: ErrorDetail[];
}

// Tipo para errores de validación de class-validator
interface ValidationError {
  property: string;
  constraints?: Record<string, string>;
}

// ==================== FILTER ====================
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logError(exception, request);
    const errorResponse = this.buildErrorResponse(exception, request);

    response.status(errorResponse.error.statusCode).json(errorResponse);
  }

  private logError(exception: unknown, request: Request): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
      ip: request.ip,
      userAgent: request.get('user-agent') || undefined,
    };

    if (exception instanceof AppError) {
      winstonLogger.log(exception.isOperational ? 'warn' : 'error', exception.message, {
        ...logEntry,
        error: exception.message,
        stack: exception.stack,
      });
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      winstonLogger.log(status >= 500 ? 'error' : 'warn', 'HttpException', {
        ...logEntry,
        error: exception.message,
        stack: exception.stack,
      });
    } else if (exception instanceof Error) {
      winstonLogger.error('Unexpected Error', {
        ...logEntry,
        error: exception.message,
        stack: exception.stack,
      });
    } else {
      winstonLogger.error('Unknown Error Type', {
        ...logEntry,
        error: String(exception),
      });
    }
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponseBody {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // ========== APP ERROR ==========
    if (this.isAppError(exception)) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.serializeErrors(),
          timestamp,
          path,
          method,
          statusCode: exception.statusCode,
        },
      };
    }

    // ========== HTTP EXCEPTION ==========
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = this.getHttpExceptionMessage(response);
      const details = this.extractHttpExceptionDetails(response);

      return {
        success: false,
        error: {
          code: this.getHttpExceptionCode(status),
          message,
          details,
          timestamp,
          path,
          method,
          statusCode: status,
        },
      };
    }

    // ========== UNKNOWN ERROR ==========
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor',
        timestamp,
        path,
        method,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    };
  }

  // ==================== HELPER METHODS ====================
  private isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  private isHttpExceptionResponse(obj: unknown): obj is HttpExceptionResponse {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      ('message' in obj || 'error' in obj || 'statusCode' in obj)
    );
  }

  private isValidationError(obj: unknown): obj is ValidationError {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'property' in obj &&
      typeof (obj as Record<string, unknown>).property === 'string'
    );
  }

  private getHttpExceptionMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }

    if (!this.isHttpExceptionResponse(response)) {
      return 'Error HTTP';
    }

    const { message, error } = response;

    if (typeof message === 'string') {
      return message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (Array.isArray(message) && message.length > 0) {
      return 'Error de validación';
    }

    return 'Error HTTP';
  }

  private extractHttpExceptionDetails(response: string | object): ErrorDetail[] {
    const details: ErrorDetail[] = [];

    if (typeof response === 'string' || !this.isHttpExceptionResponse(response)) {
      return details;
    }

    // ✅ PRIMERO: Buscar 'details' directamente
    if ('details' in response && Array.isArray(response.details)) {
      for (const detail of response.details) {
        if (this.isErrorDetail(detail)) {
          details.push(detail);
        }
      }

      if (details.length > 0) {
        return details;
      }
    }

    // ✅ SEGUNDO: Mensajes de class-validator tradicionales
    if ('message' in response && Array.isArray(response.message)) {
      for (const error of response.message) {
        if (this.isValidationError(error)) {
          const messages = Object.values(error.constraints || {});
          details.push({
            field: error.property,
            message: messages.join(', ') || 'Campo inválido',
          });
        }
      }
    }

    // ✅ TERCERO: Si no hay detalles específicos, usar el mensaje general
    if (details.length === 0 && 'message' in response && typeof response.message === 'string') {
      details.push({ message: response.message });
    }

    return details;
  }

  private isErrorDetail(obj: unknown): obj is ErrorDetail {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'message' in obj &&
      typeof (obj as Record<string, unknown>).message === 'string'
    );
  }

  private getHttpExceptionCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return codes[status] || 'HTTP_ERROR';
  }
}
