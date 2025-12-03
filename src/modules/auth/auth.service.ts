import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordService } from '@/common/services/password.service';

import type { UserOutput } from '@/modules/users/types/user.output.type';
import type { UserWithPasswordFromRepo } from '@/modules/users/types/user.repo.type';

import type { RegisterInput } from './types/auth.input.type';
import type { LoginInput } from './types/auth.input.type';
import type { LoginOutput } from './types/auth.output.type';
import type { RegisterOutput } from './types/auth.output.type';
import type { AuthPayload } from './types/auth.shared.type';
import type { AuthTokens } from './types/auth.shared.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  async register(registerInput: RegisterInput): Promise<RegisterOutput> {
    // Crear usuario usando el servicio de users
    const user: UserOutput = await this.usersService.createUserPublic({
      name: registerInput.name,
      phone: registerInput.phone,
      password: registerInput.password,
    });

    // Generar tokens
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

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { phone, password } = loginInput;

    // Buscar usuario con contraseña
    const userWithPassword: UserWithPasswordFromRepo | null =
      await this.usersService.findWithPassword(phone);
    if (!userWithPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      userWithPassword.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener usuario para respuesta (sin password)
    const userOutput: UserOutput = await this.usersService.findByPhone(phone);

    // Generar tokens
    const tokens = this.generateTokens({
      id: userWithPassword.id,
      phone: userWithPassword.phone,
      role: userWithPassword.role,
    });

    return {
      tokens,
      user: userOutput,
    };
  }

  async validateToken(token: string): Promise<AuthPayload> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  // async refreshToken(refreshToken: string): Promise<AuthTokens> {
  //   // Implementar lógica de refresh token si es necesario
  //   throw new Error('Método no implementado');
  // }

  // ---------- MÉTODOS PRIVADOS ----------

  private generateTokens(payload: Omit<AuthPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      // refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
