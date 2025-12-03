import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import type { JwtPayload, AuthUserOutput } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('app.jwt.secret'),
    });
  }

  /**
   * Validar payload del JWT
   * Este método se llama automáticamente después de verificar el token
   */
  async validate(payload: JwtPayload): Promise<AuthUserOutput> {
    // Validar que el usuario existe y está activo
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Este objeto se añadirá a request.user
    return user;
  }
}
