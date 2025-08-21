import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/types/express';

export interface AuthRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const [, token] = authHeader.split(' ');

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = payload; // aquí se asigna correctamente
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
