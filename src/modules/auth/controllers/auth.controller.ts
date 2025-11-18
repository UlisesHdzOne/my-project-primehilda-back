import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { JwtAuthGuard, Public } from 'src/common/guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@UserId() userId: number) {
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@UserId() userId: number) {
    // En una implementación completa, aquí validarías un refresh token
    // Por ahora, simplemente devolvemos el perfil
    return this.authService.getProfile(userId);
  }
}
