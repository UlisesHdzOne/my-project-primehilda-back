import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { plainToInstance } from 'class-transformer';
import { CreateUserByPublicDto } from '../users/dto/create-user-by-public.dto';
import { RequestUser } from '@/common/interfaces/request-user.interface';
import { PasswordService } from '@/common/services/password.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService, // ← Inyectar
  ) {}

  async register(
    registerDto: CreateUserByPublicDto,
  ): Promise<{ access_token: string; user: UserResponseDto }> {
    const { name, phone, password } = registerDto;

    // Crear usuario usando el DTO de creación
    const user = await this.usersService.createUserPublic({
      name,
      phone,
      password,
    });

    // Generar token JWT
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    const user = await this.usersService.findWithPassword(phone);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    // ✅ Optimización: No buscar de nuevo el usuario
    const userResponse = plainToInstance(UserResponseDto, user);

    // ✅ Usar RequestUser como payload (sin iat/exp que los agrega JWT)
    const payload: Omit<RequestUser, 'iat' | 'exp'> = {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: userResponse,
    };
  }
  async validateUser(payload: RequestUser) {
    return await this.usersService.findById(payload.id);
  }
}
