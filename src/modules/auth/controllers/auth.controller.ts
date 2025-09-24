import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import type { Response } from 'express';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<RegisterResponseDto> {
    const user = await this.authService.registerUser(dto);
    return user;
  }

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { token, user } = await this.authService.login(dto);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });
    return user;
  }
}
