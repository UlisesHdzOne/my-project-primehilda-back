import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login-user.dto';
import { RegisterDto } from '../dto/register-user.dto';
import { JwtPayload } from 'src/types/express';
import { hashPassword } from 'src/utils/auth.utils';
import { Role } from 'src/common/constants/role.enum';
import { AuthValidator } from './auth.validator';
import { UserPublicEntity } from '../entities/user.public.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authValidator: AuthValidator,
  ) {}

  /**
   * Registro de usuarioApiResponse
   */
  async register(dto: RegisterDto): Promise<void> {
    await this.authValidator.validateRegister(dto);
    const hashedPassword = await hashPassword(dto.password);

    await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: Role.CONSUMER,
        lastName: dto.lastName || 'modificar apellido',
      },
    });
  }

  /**
   * Login de usuario
   */
  async login(
    dto: LoginDto,
  ): Promise<{ user: UserPublicEntity; token: string }> {
    const user = await this.authValidator.validateLogin(dto);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: UserPublicEntity.fromPrisma(user),
      token,
    };
  }
}
