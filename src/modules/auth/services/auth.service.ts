import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { JwtPayload } from 'src/types/express';
import { hashPassword } from 'src/utils/auth.utils';
import { UserEntity } from '../entities/user.entity';
import { Role } from 'src/common/constants/role.enum';
import { AuthValidator } from './auth.validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authValidator: AuthValidator,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<UserEntity> {
    await this.authValidator.validateRegister(dto);

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword, role: Role.CONSUMER },
    });

    return new UserEntity(user);
  }

  async login(dto: LoginUserDto): Promise<{ user: UserEntity; token: string }> {
    const user = await this.authValidator.validateLogin(dto);

    const role = Object.values(Role).includes(user.role as Role)
      ? (user.role as Role)
      : Role.USER;

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role,
    };

    const token = this.jwtService.sign(payload);

    return { user: new UserEntity(user), token };
  }
}
