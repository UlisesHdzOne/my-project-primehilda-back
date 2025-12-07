import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/custom.errors';
import { winstonLogger } from '../logger/winston.config';

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
    statusCode: number;
  };
}

type ExceptionResponse =
  | string
  | {
      message?:
        | string
        | Array<{
            property: string;
            constraints?: Record<string, string>;
          }>;
      details?: ErrorDetail[];
      error?: string;
    };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logErrorWithWinston(exception, request);

    const errorResponse = this.buildErrorResponse(exception, request);

    response.status(errorResponse.error.statusCode).json(errorResponse);
  }

  private logErrorWithWinston(exception: unknown, request: Request): void {
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
      if (exception.isOperational) {
        winstonLogger.warn('Operational Error', logEntry);
      } else {
        winstonLogger.error('Application Error', logEntry);
      }
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        winstonLogger.error('Server Error', logEntry);
      } else {
        winstonLogger.warn('Client Error', logEntry);
      }
    } else {
      winstonLogger.error('Unexpected Error', logEntry);
    }
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponseBody {
    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof AppError) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.serializeErrors(),
          timestamp,
          path,
          statusCode: exception.statusCode,
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        success: false,
        error: {
          code: this.getHttpExceptionCode(status),
          message: this.getHttpExceptionMessage(exceptionResponse),
          details: this.getHttpExceptionDetails(exceptionResponse),
          timestamp,
          path,
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
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    };
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

  private getHttpExceptionMessage(response: unknown): string {
    if (typeof response === 'string') return response;

    if (response && typeof response === 'object') {
      const res = response as ExceptionResponse;

      if (typeof res === 'string') return res;

      if (typeof res.message === 'string') return res.message;

      if (Array.isArray(res.message)) return 'Error de validación';

      if (typeof res.error === 'string') return res.error;
    }

    return 'Error HTTP';
  }

  private getHttpExceptionDetails(response: unknown): ErrorDetail[] {
    const details: ErrorDetail[] = [];

    if (response && typeof response === 'object') {
      const res = response as ExceptionResponse;

      if (typeof res === 'string') return details;

      if (Array.isArray(res.details)) return res.details;

      if (Array.isArray(res.message)) {
        for (const error of res.message) {
          if (error.constraints) {
            const messages = Object.values(error.constraints);
            details.push({
              field: error.property,
              message: messages.join(', '),
            });
          }
        }
      }
    }

    return details;
  }
}

export type { ErrorResponseBody, ErrorDetail };
