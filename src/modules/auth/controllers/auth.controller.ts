// controllers/auth.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import type { Response } from 'express';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    // devuelve user plano -> interceptor -> { success:true, data: user }
    return this.authService.registerUser(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    // AuthService.login ahora devuelve { user, token } plano
    const { user, token } = await this.authService.login(dto);

    // set cookie HTTP-only
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    // devuelve objeto plano -> interceptor lo transforma en { success:true, data: { user, token } }
    return user;
  }
}
