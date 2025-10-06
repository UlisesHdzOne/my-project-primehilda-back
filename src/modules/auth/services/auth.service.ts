import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { JwtPayload } from 'src/types/express';
import { hashPassword } from 'src/utils/auth.utils';
import { AuthBusinessValidatorLogin } from '../validators-business/auth-business-login.validator';
import { AuthBusinessValidatorRegister } from '../validators-business/auth=business-register.validator';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<UserEntity> {
    await AuthBusinessValidatorRegister.validar(dto, this.prisma);

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    return new UserEntity(user);
  }

  async login(dto: LoginUserDto): Promise<{ user: UserEntity; token: string }> {
    const user = await AuthBusinessValidatorLogin.validar(dto, this.prisma);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return { user: new UserEntity(user), token };
  }
}
