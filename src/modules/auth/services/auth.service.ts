// src/modules/auth/services/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { RegisterUserDto } from '../dto/register-user.dto';
import { validateRegisterUser, validateLoginUser } from 'src/modules/user/utils/user.validator';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    await validateRegisterUser(dto, this.prisma);

    const hashedPassword = await hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginUserDto) {
    const user = await validateLoginUser(dto, this.prisma);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}