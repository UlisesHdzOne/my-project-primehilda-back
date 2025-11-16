import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/types/express';

interface Cookies {
  access_token?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    let token: string | undefined;

    // Intentar leer token desde header Authorization
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const [, t] = authHeader.split(' ');
      token = t;
    }

    // Intentar leer token desde cookies, tipadas
    const cookies = req.cookies as Cookies;
    if (!token && cookies?.access_token) {
      token = cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
