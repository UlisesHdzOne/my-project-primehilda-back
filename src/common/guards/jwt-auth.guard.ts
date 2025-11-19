import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

// Clave para metadata de endpoints públicos
export const IS_PUBLIC_KEY = 'isPublic';

// Decorador para endpoints públicos
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      this.logger.warn(`Intento de acceso sin token: ${request.method} ${request.url}`);
      throw new UnauthorizedException('Token de acceso no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('app.jwt.secret'),
      });

      // Asignar usuario a la request
      request['user'] = payload;
      return true;
    } catch (error) {
      this.logger.warn(`Token inválido: ${error.message}`);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }

      throw new UnauthorizedException('Error de autenticación');
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // 1. Header Authorization
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Cookies
    const cookies = request.cookies as { access_token?: string };
    if (cookies?.access_token) {
      return cookies.access_token;
    }

    // 3. Query parameter
    if (request.query && typeof request.query.access_token === 'string') {
      return request.query.access_token;
    }

    return undefined;
  }
}
