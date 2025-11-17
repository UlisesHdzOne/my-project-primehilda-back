import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const statusCode = response.statusCode;

    // Excluir ciertas rutas del formateo
    if (this.shouldExclude(path)) {
      return next.handle() as Observable<ApiResponse<T>>;
    }

    return next.handle().pipe(
      map(data => {
        return this.formatResponse(data, timestamp, path, method, statusCode);
      }),
    );
  }

  private shouldExclude(path: string): boolean {
    const excludedPaths = ['/health', '/metrics', '/api', '/favicon.ico'];
    return excludedPaths.some(excludedPath => path.startsWith(excludedPath));
  }

  private formatResponse(
    data: T,
    timestamp: string,
    path: string,
    method: string,
    statusCode: number,
  ): ApiResponse<T> {
    // Si ya es una respuesta formateada con success
    if (this.isApiResponse(data)) {
      return {
        success: (data as any).success,
        data: (data as any).data || data,
        message: (data as any).message,
        timestamp: (data as any).timestamp || timestamp,
        path,
        method,
        statusCode,
      };
    }

    // Si es solo un mensaje
    if (this.isMessageOnly(data)) {
      return {
        success: true,
        data: {} as T,
        message: (data as any).message,
        timestamp,
        path,
        method,
        statusCode,
      };
    }

    // Si es una respuesta vacía (DELETE, etc.)
    if (this.isEmptyResponse(data, statusCode)) {
      return {
        success: true,
        data: {} as T,
        message: this.getEmptyResponseMessage(method),
        timestamp,
        path,
        method,
        statusCode,
      };
    }

    // Respuesta estándar
    return {
      success: true,
      data,
      timestamp,
      path,
      method,
      statusCode,
    };
  }

  private isApiResponse(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    return 'success' in (data as any);
  }

  private isMessageOnly(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return 'message' in obj && Object.keys(obj).length === 1;
  }

  private isEmptyResponse(data: unknown, statusCode: number): boolean {
    return (data === undefined || data === null) && [200, 201, 204].includes(statusCode);
  }

  private getEmptyResponseMessage(method: string): string {
    const messages: Record<string, string> = {
      DELETE: 'Recurso eliminado exitosamente',
      POST: 'Recurso creado exitosamente',
      PUT: 'Recurso actualizado exitosamente',
      PATCH: 'Recurso actualizado exitosamente',
    };
    return messages[method] || 'Operación completada exitosamente';
  }
}
