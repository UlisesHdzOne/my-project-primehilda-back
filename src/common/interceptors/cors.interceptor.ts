import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

interface CorsConfig {
  origin: string | string[];
  methods: string[];
  credentials: boolean;
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

@Injectable()
export class CorsHeadersInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    const corsConfig = this.configService.get<CorsConfig>('app.cors');

    if (!corsConfig) {
      return next.handle();
    }

    // Set CORS headers
    if (corsConfig.origin) {
      const origin = Array.isArray(corsConfig.origin)
        ? this.determineOrigin(corsConfig.origin, request.headers.origin)
        : corsConfig.origin;

      if (origin) {
        response.setHeader('Access-Control-Allow-Origin', origin);
      }
    }

    if (corsConfig.credentials) {
      response.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (corsConfig.exposedHeaders && corsConfig.exposedHeaders.length > 0) {
      response.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      if (corsConfig.allowedHeaders && corsConfig.allowedHeaders.length > 0) {
        response.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      }

      if (corsConfig.methods && corsConfig.methods.length > 0) {
        response.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
      }

      if (corsConfig.maxAge > 0) {
        response.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString());
      }

      response.status(corsConfig.optionsSuccessStatus || 204).send();
      return new Observable<never>(observer => observer.complete());
    }

    return next.handle().pipe(map(data => data));
  }

  private determineOrigin(allowedOrigins: string[], requestOrigin?: string): string {
    if (allowedOrigins.includes('*')) {
      return '*';
    }

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      return requestOrigin;
    }

    // Return first origin if request origin not in list
    return allowedOrigins[0];
  }
}
