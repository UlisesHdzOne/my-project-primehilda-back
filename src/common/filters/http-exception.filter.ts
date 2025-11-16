import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

interface NestExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  details?: ValidationErrorDetail[];
  [key: string]: unknown;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  code: number;
  timestamp: string;
  path: string;
  method: string;
  requestId: string;
  details: ValidationErrorDetail[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, errorResponse } = this.getErrorResponse(exception, request);

    this.logSafeError(exception, request, errorResponse, status);

    response.status(status).json(errorResponse);
  }

  private logSafeError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
    status: number,
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      this.logger.error(
        `🚨 [${errorResponse.code}] ${request.method} ${request.url} - ${errorResponse.error}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      if (errorResponse.details.length > 0) {
        this.logger.debug(
          '📋 Error details:',
          JSON.stringify(errorResponse.details),
        );
      }
    } else {
      this.logger.error(
        `🚨 [${errorResponse.code}] ${request.method} ${request.url} - ${errorResponse.error}`,
      );
    }
  }

  private getErrorResponse(
    exception: unknown,
    request: Request,
  ): { status: number; errorResponse: ErrorResponse } {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let details: ValidationErrorDetail[] = [];

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const typedRes: NestExceptionResponse =
        typeof res === 'object' && res !== null
          ? (res as NestExceptionResponse)
          : { message: 'Error desconocido' };
      error = typedRes.error || this.getErrorName(exception);

      // ✅ Si vienen details, usarlos tal cual (sin concatenar)
      if (typedRes.details && Array.isArray(typedRes.details)) {
        details = typedRes.details.map((d) => ({
          field: d.field || 'general',
          message: d.message,
          value: d.value,
        }));
      } else if (Array.isArray(typedRes.message)) {
        details = typedRes.message.map((msg) => ({
          field: 'general',
          message: msg,
        }));
      } else if (typeof typedRes.message === 'string') {
        details = [{ field: 'general', message: typedRes.message }];
      }
    } else {
      details = [{ field: 'general', message: 'Error interno del servidor' }];
    }

    return {
      status,
      errorResponse: {
        success: false,
        error,
        code: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId: this.generateRequestId(),
        details,
      },
    };
  }

  private getErrorName(exception: HttpException): string {
    const status = exception.getStatus();
    const map: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    };
    return map[status] || 'Error';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
