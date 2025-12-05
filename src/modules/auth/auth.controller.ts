import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { AuthService } from './auth.service';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';

// DTOs
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';

// Types
import type { LoginInput, RegisterInput } from './types/auth.types';
import type { RequestUser } from '@/common/interfaces/request-user.interface';

@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const input: RegisterInput = { name: dto.name, phone: dto.phone, password: dto.password };
    const result = await this.authService.register(input);
    return plainToInstance(AuthResponseDto, result, { excludeExtraneousValues: true });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const input: LoginInput = { phone: dto.phone, password: dto.password };
    const result = await this.authService.login(input);
    return plainToInstance(AuthResponseDto, result, { excludeExtraneousValues: true });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<{ tokens: AuthResponseDto['tokens'] }> {
    const tokens = await this.authService.refreshToken(dto.refresh_token);
    return { tokens: plainToInstance(AuthTokensDto, tokens, { excludeExtraneousValues: true }) };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@User() user: RequestUser): Promise<{ user: RequestUser }> {
    return { user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    return { message: 'Logout exitoso. Elimina el token del cliente.' };
  }
}
