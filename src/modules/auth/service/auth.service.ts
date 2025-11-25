import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UserResponseDto } from '@/modules/users/dto/response/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  // Registrar usuario
  async register(data: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.authRepository.findOneByPhone(data.phone);
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.authRepository.create({ ...data, password: hashedPassword });

    return plainToInstance(UserResponseDto, user);
  }

  // Login
  async login(
    phone: string,
    password: string,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const user = await this.authRepository.findOneByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ TypeScript ahora sabe que user.password es string
    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // ✅ MEJORAR payload con más información útil
    const payload = {
      sub: user.id,
      phone: user.phone,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);
    const safeUser = plainToInstance(UserResponseDto, user);

    return { accessToken: token, user: safeUser };
  }
}
