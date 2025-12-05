import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordService } from '@/common/services/password.service';
import type {
  AuthTokensResponse,
  AuthUserResponse,
  LoginInput,
  RegisterInput,
  JwtPayload,
} from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(
    input: RegisterInput,
  ): Promise<{ user: AuthUserResponse; tokens: AuthTokensResponse }> {
    const user = await this.usersService.createUserPublic(input);
    const tokens = this.generateTokens(user);
    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: AuthUserResponse; tokens: AuthTokensResponse }> {
    const userWithPassword = await this.usersService.findWithPassword(input.phone);
    if (!userWithPassword) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await this.passwordService.comparePassword(
      input.password,
      userWithPassword.password,
    );
    if (!valid || !userWithPassword.isActive)
      throw new UnauthorizedException('Credenciales inválidas');

    const { password: _, ...user } = userWithPassword;
    const tokens = this.generateTokens(userWithPassword);
    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokensResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.usersService.findById(payload.id);
      if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');
      return this.generateTokens(user);
    } catch (error) {
      this.logger.warn(`Refresh token inválido: ${error}`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private generateTokens(user: { id: number; phone: string; role: string }): AuthTokensResponse {
    const payload: JwtPayload = { id: user.id, phone: user.phone, role: user.role as any };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
