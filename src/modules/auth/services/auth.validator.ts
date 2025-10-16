// src/modules/auth/services/auth.validator.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { AUTH_MESSAGES } from 'src/common/constants';
import { compare } from 'bcrypt';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthValidator {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida el registro de un usuario
   */
  async validateRegister(dto: RegisterUserDto): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new BadRequestException(AUTH_MESSAGES.registroInvalido);
    }
  }

  /**
   * Valida las credenciales de login
   */
  async validateLogin(dto: LoginUserDto): Promise<UserEntity> {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const isPasswordValid = user
      ? await compare(dto.password, user.password)
      : false;

    // Verificar contraseña
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.credencialesInvalidas);
    }

    return new UserEntity(user);
  }
}
