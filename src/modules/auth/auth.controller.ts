import { Controller, Post, Body, UsePipes, ValidationPipe, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserByPublicDto } from '../users/dto/create-user-by-public.dto';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { plainToInstance } from 'class-transformer';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: CreateUserByPublicDto) {
    const result = await this.authService.register({
      name: registerDto.name,
      phone: registerDto.phone,
      password: registerDto.password,
    });

    return {
      ...result,
      user: plainToInstance(RegisterResponseDto, result.user),
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login({
      phone: loginDto.phone,
      password: loginDto.password,
    });

    return plainToInstance(AuthResponseDto, {
      access_token: result.tokens.access_token,
      user: result.user,
    });
  }
}
