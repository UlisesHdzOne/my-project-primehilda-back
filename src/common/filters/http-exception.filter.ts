// src/common/filters/http-exception.filter.ts
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
    // Verificación robusta
    if (error instanceof AppError) {
      return true;
    }

    // Fallback: verificar propiedades
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'code' in error &&
      'serializeErrors' in error &&
      'isOperational' in error &&
      'message' in error
    ) {
      const err = error as Record<string, unknown>;
      return (
        typeof err.statusCode === 'number' &&
        typeof err.code === 'string' &&
        typeof err.serializeErrors === 'function' &&
        typeof err.isOperational === 'boolean' &&
        typeof err.message === 'string'
      );
    }

    return false;
  }

  private getHttpExceptionMessage(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object') {
      const res = response as Record<string, unknown>;

      if (typeof res.message === 'string') {
        return res.message;
      }

      if (typeof res.error === 'string') {
        return res.error;
      }

      if (Array.isArray(res.message) && res.message.length > 0) {
        return 'Error de validación';
      }
    }

    return 'Error HTTP';
  }

  private extractHttpExceptionDetails(response: unknown): ErrorDetail[] {
    const details: ErrorDetail[] = [];

    if (!response || typeof response !== 'object') {
      return details;
    }

    const res = response as Record<string, unknown>;

    // ✅ PRIMERO: Buscar 'details' directamente (tu estructura actual)
    if ('details' in res && Array.isArray(res.details)) {
      for (const detail of res.details) {
        if (detail && typeof detail === 'object' && 'field' in detail && 'message' in detail) {
          const errorDetail = detail as { field: unknown; message: unknown };

          // Validar tipos
          if (typeof errorDetail.field === 'string' && typeof errorDetail.message === 'string') {
            details.push({
              field: errorDetail.field,
              message: errorDetail.message,
            });
          }
        }
      }

      if (details.length > 0) {
        return details;
      }
    }

    // ✅ SEGUNDO: Mensajes de class-validator tradicionales
    if ('message' in res && Array.isArray(res.message)) {
      for (const error of res.message) {
        if (error && typeof error === 'object' && 'property' in error && 'constraints' in error) {
          const validationError = error as {
            property: unknown;
            constraints: Record<string, string>;
          };

          if (typeof validationError.property === 'string') {
            const messages = Object.values(validationError.constraints || {});

            details.push({
              field: validationError.property,
              message: messages.join(', ') || 'Campo inválido',
            });
          }
        }
      }
    }

    // ✅ TERCERO: Si no hay detalles específicos, usar el mensaje general
    if (details.length === 0 && 'message' in res && typeof res.message === 'string') {
      details.push({ message: res.message });
    }

    return details;
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
