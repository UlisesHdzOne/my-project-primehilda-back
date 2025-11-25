import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { Public } from '@/common/guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.password);
  }
}
