import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { RegisterUserDto } from '../dto/register-user.dto';
import {
  validateLoginUser,
  validateRegisterUser,
} from 'src/modules/user/utils/user.validator';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

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

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
