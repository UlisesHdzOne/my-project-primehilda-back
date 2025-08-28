import { PrismaService } from 'src/prisma/prisma.service';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
