import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../shared/constants/role.enum';

export const ROLES_KEY = 'roles';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user; // ← YA TIPADO GLOBALMENTE

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
    }

    return true;
  }
}
