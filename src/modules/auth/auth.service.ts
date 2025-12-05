import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordService } from '@/common/services/password.service';
import type {
  LoginInput,
  LoginOutput,
  RegisterInput,
  RegisterOutput,
  AuthTokens,
  JwtPayload,
  JwtPayloadComplete,
  AuthUserOutput,
} from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(input: RegisterInput): Promise<RegisterOutput> {
    const user = await this.usersService.createUserPublic(input);

    const tokens = this.generateTokens({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    return { tokens, user };
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    const userWithPassword = await this.usersService.findWithPassword(input.phone);
    if (!userWithPassword) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await this.passwordService.comparePassword(
      input.password,
      userWithPassword.password,
    );
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');
    if (!userWithPassword.isActive) throw new UnauthorizedException('Usuario inactivo');

    const user = await this.usersService.findByPhone(input.phone);

    const tokens = this.generateTokens({
      id: userWithPassword.id,
      phone: userWithPassword.phone,
      role: userWithPassword.role,
    });

    return { tokens, user };
  }

  async validateToken(token: string): Promise<JwtPayloadComplete> {
    try {
      return this.jwtService.verify<JwtPayloadComplete>(token);
    } catch (error) {
      this.logger.warn(`Token inválido: ${error}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async validateUser(payload: JwtPayload): Promise<AuthUserOutput> {
    const user = await this.usersService.findById(payload.id);
    if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');
    return user;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<JwtPayloadComplete>(refreshToken);
      const user = await this.usersService.findById(payload.id);
      if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');

      return this.generateTokens({
        id: user.id,
        phone: user.phone,
        role: user.role,
      });
    } catch (error) {
      this.logger.warn(`Refresh token inválido: ${error}`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private generateTokens(payload: JwtPayload): AuthTokens {
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
