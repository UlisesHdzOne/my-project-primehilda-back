// services/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtPayload } from 'src/types/express';
import { hashPassword } from 'src/utils/auth.utils';
import { AuthBusinessValidatorLogin } from '../rules/auth-login.rules';
import { AuthBusinessValidatorRegister } from '../rules/auth-register.rules';
import { AuthLoginValidator } from 'src/validators/auth-login.validator';
import { AuthRegisterValidator } from 'src/validators/auth-register.validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // register -> devuelve el user plano (el interceptor lo envolverá)
  async registerUser(dto: RegisterUserDto): Promise<UserResponseDto> {
    AuthRegisterValidator.validarEntradaRegister(dto);
    await AuthBusinessValidatorRegister.validar(dto, this.prisma);

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    const { password, ...safeUser } = user;
    return safeUser; // tipo UserResponseDto
  }

  // login -> devuelve { user, token } plano
  async login(
    dto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    AuthLoginValidator.validarEntrada(dto);
    const user = await AuthBusinessValidatorLogin.validar(dto, this.prisma);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    const { password, ...safeUser } = user;
    return { user: safeUser, token }; // tipo claro y plano
  }
}
