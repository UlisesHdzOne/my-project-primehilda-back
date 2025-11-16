import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login-user.dto';
import { RegisterDto } from '../dto/register-user.dto';
import type { Response } from 'express';
import { AuthUserResponseDto } from '../dto/AuthUserResponseDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return { message: 'Usuario registrado exitosamente' };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    const { user, token } = await this.authService.login(dto);

    // Guardar token en cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hora
    });

    return AuthUserResponseDto.fromEntity(user);
  }
}
