import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtPayload } from 'src/types/express';
import { hashPassword } from 'src/utils/auth.utils';
import { AuthBusinessValidatorLogin } from '../validators-business/auth-business-login.validator';
import { AuthLoginValidator } from 'src/validators/auth-login.validator';
import { AuthRegisterValidator } from 'src/validators/auth-register.validator';
import { AuthBusinessValidatorRegister } from '../validators-business/auth=business-register.validator';
import { throwNotFound } from 'src/common/helper/error.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<UserResponseDto> {
    AuthRegisterValidator.validarEntrada(dto);

    await AuthBusinessValidatorRegister.validar(dto, this.prisma);

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async login(
    dto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    AuthLoginValidator.validarEntrada(dto);

    const user = await AuthBusinessValidatorLogin.validar(dto, this.prisma);

    if (!user) {
      throwNotFound('Usuario no encontrado');
    }

    const payload: JwtPayload = {
      id: user!.id,
      email: user!.email,
      role: user!.role,
    };

    const token = this.jwtService.sign(payload);

    const { password, ...safeUser } = user!;
    return { user: safeUser, token };
  }
}
