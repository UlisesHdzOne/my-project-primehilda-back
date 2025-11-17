import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface Cookies {
  access_token?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromRequest(req);

    if (!token) {
      throw new UnauthorizedException('Token de acceso no proporcionado');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      req.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromRequest(req: Request): string | undefined {
    // 1. Intentar desde header Authorization
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Intentar desde cookies
    const cookies = req.cookies as Cookies;
    if (cookies?.access_token) {
      return cookies.access_token;
    }

    return undefined;
  }
}
