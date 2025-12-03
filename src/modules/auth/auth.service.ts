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
  // 🔐 AUTENTICACIÓN
  // ============================================

  /**
   * Registrar nuevo usuario
   */
  async register(registerInput: RegisterInput): Promise<RegisterOutput> {
    // 1. Crear usuario usando el servicio de users
    const user = await this.usersService.createUserPublic({
      name: registerInput.name,
      phone: registerInput.phone,
      password: registerInput.password,
    });

    // 2. Generar tokens
    const tokens = this.generateTokens({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    // 3. Retornar respuesta
    // ✅ user ya es UserOutput (sin password)
    return {
      tokens,
      user: user as AuthUserOutput, // Type assertion seguro aquí
    };
  }

  /**
   * Login de usuario
   */
  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { phone, password } = loginInput;

    // 1. Buscar usuario con password
    const userWithPassword = await this.usersService.findWithPassword(phone);

    if (!userWithPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      userWithPassword.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Verificar que el usuario esté activo
    if (!userWithPassword.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 4. Obtener usuario sin password (para respuesta)
    const user = await this.usersService.findByPhone(phone);

    // 5. Generar tokens
    const tokens = this.generateTokens({
      id: userWithPassword.id,
      phone: userWithPassword.phone,
      role: userWithPassword.role,
    });

    return {
      tokens,
      user: user as AuthUserOutput,
    };
  }

  /**
   * Validar token JWT
   */
  async validateToken(token: string): Promise<JwtPayloadComplete> {
    try {
      const payload = this.jwtService.verify<JwtPayloadComplete>(token);
      return payload;
    } catch (error) {
      this.logger.warn(`Token inválido: ${error}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Validar usuario desde payload JWT (usado por JwtStrategy)
   */
  async validateUser(payload: JwtPayload): Promise<AuthUserOutput> {
    // Verificar que el usuario existe y está activo
    const user = await this.usersService.findById(payload.id);

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user as AuthUserOutput;
  }

  /**
   * Refresh token (opcional - para implementación futura)
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<JwtPayloadComplete>(refreshToken);

      // Verificar que el usuario existe
      const user = await this.usersService.findById(payload.id);

      if (!user.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // Generar nuevos tokens
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
  // 🔧 MÉTODOS PRIVADOS
  // ============================================

  /**
   * Generar tokens JWT (access + refresh)
   */
  private generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Configurar desde environment
    });

    // Refresh token (opcional - expiración más larga)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Verificar que el payload del JWT tiene los campos requeridos
   */
  //  private validatePayloadStructure(payload: unknown): payload is JwtPayload {
  //   return (
  //     typeof payload === 'object' &&
  //     payload !== null &&
  //     'id' in payload &&
  //     'phone' in payload &&
  //     'role' in payload
  //   );
  // }
}
