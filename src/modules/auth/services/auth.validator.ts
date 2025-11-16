import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login-user.dto';
import { AUTH_MESSAGES } from 'src/common/constants';
import { compare } from 'bcrypt';
import { User } from '@prisma/client';

interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

@Injectable()
export class AuthValidator {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== REGISTRO ====================
  async validateRegister(dto: RegisterDto): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
      select: { email: true, phone: true },
    });

    const errors: ValidationErrorDetail[] = [];

    if (existingUser?.email === dto.email) {
      errors.push({
        field: 'email',
        message: AUTH_MESSAGES.emailExistente,
        value: dto.email,
      });
    }

    if (existingUser?.phone === dto.phone) {
      errors.push({
        field: 'phone',
        message: AUTH_MESSAGES.telefonoExistente,
        value: dto.phone,
      });
    }

    if (!this.isStrongPassword(dto.password)) {
      errors.push({ field: 'password', message: AUTH_MESSAGES.passwordDebil });
    }

    if (this.isCommonPassword(dto.password)) {
      errors.push({ field: 'password', message: 'La contraseña es muy común' });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        error: 'Bad Request',
        code: 400,
        details: errors,
      });
    }
  }

  // ==================== LOGIN ====================
  async validateLogin(dto: LoginDto): Promise<User> {
    // Buscar usuario en DB
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException({
        error: 'Authentication Error',
        code: 401,
        details: [
          { field: 'email', message: AUTH_MESSAGES.credencialesInvalidas },
        ],
      });
    }

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        error: 'Authentication Error',
        code: 401,
        details: [
          { field: 'password', message: AUTH_MESSAGES.credencialesInvalidas },
        ],
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        error: 'Authentication Error',
        code: 401,
        details: [{ field: 'general', message: AUTH_MESSAGES.cuentaInactiva }],
      });
    }

    return user;
  }

  private isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    );
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = ['12345678', 'password', 'admin123'];
    return commonPasswords.includes(password.toLowerCase());
  }
}
