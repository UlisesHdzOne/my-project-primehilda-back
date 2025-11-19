import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { comparePassword } from '../../../shared/utils/auth.utils';
import { UsersService } from 'src/modules/users/services/users.service';
import { UserResponseDto } from 'src/modules/users/dtos/responses/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(registerDto);
    return new UserResponseDto(user);
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValidPassword = await comparePassword(loginDto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    return this.generateTokenResponse(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await comparePassword(password, user.password))) {
      // ✅ CORREGIDO: usar _ para variables no utilizadas
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }

  private generateTokenResponse(user: any): TokenResponseDto {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const expiresIn = this.configService.get<number>('app.jwt.expiresIn') ?? 3600;

    return new TokenResponseDto({
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  async getProfile(userId: number) {
    return this.usersService.findById(userId);
  }
}
