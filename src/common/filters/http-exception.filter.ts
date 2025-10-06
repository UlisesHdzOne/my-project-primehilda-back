import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string[] = [];
    let error = 'ERROR';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = [res];
      } else if (Array.isArray(res)) {
        message = res as string[];
      } else if (res && typeof res === 'object') {
        const typedRes = res as ExceptionResponse;
        const maybeMsg = typedRes.message;

        if (Array.isArray(maybeMsg)) message = maybeMsg;
        else if (typeof maybeMsg === 'string') message = [maybeMsg];
        else message = ['Unexpected error'];

        error = typedRes.error || exception.name.toUpperCase();
      } else {
        message = ['Unexpected error'];
      }
    } else {
      message = ['Internal server error'];
      error = 'INTERNAL_SERVER_ERROR';
    }

    response.status(status).json({
      success: false,
      message,
      error,
      code: status,
    });
  }
}
