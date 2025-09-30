import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/express';
import { hashPassword } from 'src/utils/auth.utils';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthRegisterValidator } from 'src/validators/auth-register.validator';
import { AuthBusinessValidatorRegister } from '../rules/auth-register.rules';
import { AuthLoginValidator } from 'src/validators/auth-login.validator';
import { AuthBusinessValidatorLogin } from '../rules/auth-login.rules';
import { RegisterResponseDto } from '../dto/register-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<RegisterResponseDto> {
    AuthRegisterValidator.validarEntradaRegister(dto);

    await AuthBusinessValidatorRegister.validar(dto, this.prisma);

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    const registerResponse: RegisterResponseDto = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
    return registerResponse;
  }

  async login(
    dto: LoginUserDto,
  ): Promise<{ user: LoginResponseDto; token: string }> {
    AuthLoginValidator.validarEntrada(dto);

    const user = await AuthBusinessValidatorLogin.validar(dto, this.prisma);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    const loginResponse: LoginResponseDto = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return { user: loginResponse, token };
  }
}
