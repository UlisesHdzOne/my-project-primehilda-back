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
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  // ============================================
  // 🔐 REGISTRO
  // ============================================

  async register(registerInput: RegisterInput): Promise<RegisterOutput> {
    const user = await this.usersService.createUserPublic(registerInput);

    const tokens = this.generateTokens({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    return {
      tokens,
      user,
    };
  }

  // ============================================
  // 🔐 LOGIN
  // ============================================

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { phone, password } = loginInput;

    const userWithPassword = await this.usersService.findWithPassword(phone);

    if (!userWithPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      userWithPassword.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!userWithPassword.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Usuario sin password (safe)
    const user = await this.usersService.findByPhone(phone);

    const tokens = this.generateTokens({
      id: userWithPassword.id,
      phone: userWithPassword.phone,
      role: userWithPassword.role,
    });

    return {
      tokens,
      user,
    };
  }

  // ============================================
  // 🔐 VALIDACIÓN DE TOKEN
  // ============================================

  async validateToken(token: string): Promise<JwtPayloadComplete> {
    try {
      return this.jwtService.verify<JwtPayloadComplete>(token);
    } catch (error) {
      this.logger.warn(`Token inválido: ${error}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  // ============================================
  // 🔐 VALIDAR USUARIO (JWT Strategy)
  // ============================================

  async validateUser(payload: JwtPayload): Promise<AuthUserOutput> {
    const user = await this.usersService.findById(payload.id);

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user;
  }

  // ============================================
  // 🔐 REFRESH TOKEN
  // ============================================

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<JwtPayloadComplete>(refreshToken);

      const user = await this.usersService.findById(payload.id);

      if (!user.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

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

  // ============================================
  // 🔧 PRIVADOS
  // ============================================

  private generateTokens(payload: JwtPayload): AuthTokens {
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
