import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { RequestUser } from '../../../common/interfaces/request-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('app.jwt.secret'),
    });
  }

  async validate(payload: RequestUser): Promise<RequestUser> {
    const user = await this.authService.validateUser(payload);
    
    // Retornar objeto tipado como RequestUser
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}