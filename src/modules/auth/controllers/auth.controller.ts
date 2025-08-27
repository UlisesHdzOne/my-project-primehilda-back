import { PrismaService } from 'src/prisma/prisma.service';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import {
  checkUserEmailUnique,
  checkUserExistsByEmail,
} from '../utils/auth.validator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    await checkUserEmailUnique(dto.email, this.prisma);
    return this.authService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    await checkUserExistsByEmail(dto.email, this.prisma);
    return this.authService.login(dto);
  }
}
