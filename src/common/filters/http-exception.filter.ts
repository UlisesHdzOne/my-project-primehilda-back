import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../../core/errors/custom.errors';
import { winstonLogger } from '../../core/logger/winston.config';

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

// Tipo seguro para errores de validación
interface ValidationError {
  property: string;
  constraints?: Record<string, string>;
}

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

  private logError(exception: unknown, request: Request) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
      ip: request.ip,
      userAgent: request.get('user-agent') || undefined,
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (exception instanceof AppError) {
      winstonLogger.log(exception.isOperational ? 'warn' : 'error', exception.message, logEntry);
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      winstonLogger.log(status >= 500 ? 'error' : 'warn', 'HttpException', logEntry);
    } else {
      winstonLogger.error('Unexpected Error', logEntry);
    }
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponseBody {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    if (exception instanceof AppError) {
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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      const message = this.getHttpExceptionMessage(res, exception);
      const details = this.extractDetails(res);

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

  private getHttpExceptionMessage(response: unknown, exception: HttpException): string {
    if (typeof response === 'string') return response;

    if (response && typeof response === 'object') {
      if ('message' in response && typeof response.message === 'string') return response.message;
      if ('error' in response && typeof response.error === 'string') return response.error;
    }

    return exception.message || 'Error HTTP';
  }

  private extractDetails(response: unknown): ErrorDetail[] {
    const details: ErrorDetail[] = [];

    if (response && typeof response === 'object' && 'message' in response) {
      const res = response as Record<string, unknown>;

      if (Array.isArray(res.message)) {
        for (const error of res.message) {
          // type guard seguro
          if (
            error &&
            typeof error === 'object' &&
            'property' in error &&
            'constraints' in error &&
            typeof error.constraints === 'object' &&
            error.constraints !== null
          ) {
            const validationError = error as ValidationError;
            const messages = validationError.constraints
              ? Object.values(validationError.constraints)
              : [];
            details.push({
              field: validationError.property,
              message: messages.join(', '),
            });
          }
        }
      }
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

export type { ErrorResponseBody, ErrorDetail };
