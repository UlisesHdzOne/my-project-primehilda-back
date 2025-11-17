import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;
  return 'success' in o && typeof o['success'] === 'boolean' && 'data' in o;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      map(data => {
        // Si ya es una respuesta formateada, la retornamos tal cual
        if (isApiResponse<T>(data)) {
          return {
            ...data,
            timestamp: data.timestamp || timestamp,
          };
        }

        // Para respuestas que son solo mensajes (sin data)
        if (typeof data === 'object' && data !== null && 'message' in data) {
          return {
            success: true,
            data: {} as T,
            message: (data as any).message,
            timestamp,
          };
        }

        // Respuesta estándar con data
        return {
          success: true,
          data: data as T,
          timestamp,
        };
      }),
    );
  }
}
