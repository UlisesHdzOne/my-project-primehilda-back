import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Aquí puedes añadir lógica adicional antes de llamar al padre
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: Error | null, user: TUser, _info: Error): TUser {
    // Manejo de errores personalizado
    if (err || !user) {
      throw err || new UnauthorizedException('No autorizado');
    }
    return user;
  }
}
