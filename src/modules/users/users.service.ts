import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { IUserRepository } from './repositories/user-repository.interface';
import { Role, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserByPublicDto } from './dto/create-user-by-public.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { PasswordService } from '@/common/services/password.service';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
    private passwordService: PasswordService,
    
  ) {}

  async findByPhone(phone: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByPhone(phone);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return plainToInstance(UserResponseDto, user);
  }

  async findUsers(params: FindUsersQueryDto): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findMany({
      skip: params.skip ?? 0,
      take: params.take ?? 10,
      search: params.search,
      role: params.role,
      isActive: params.isActive,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    });

    return users.map(u => plainToInstance(UserResponseDto, u));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return plainToInstance(UserResponseDto, user);
  }

  // Creación por administrador
  async createUserByAdmin(createUserDto: CreateUserByAdminDto): Promise<UserResponseDto> {
    await this.verifyUserNotExists(createUserDto.phone);

    const { plain, hash } = await this.processPassword(createUserDto.password);

    const user = await this.userRepository.create({
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: hash,
      role: createUserDto.role || Role.CONSUMER,
      isActive: createUserDto.isActive ?? true,
    });

    // Notificar si no se proporcionó contraseña
    if (!createUserDto.password) {
      await this.notifyUserWithPassword(createUserDto.phone, plain);
    }

    return plainToInstance(UserResponseDto, user);
  }

  // Creación pública
  async createUserPublic(createUserData: CreateUserByPublicDto): Promise<UserResponseDto> {
    await this.verifyUserNotExists(createUserData.phone);

    const { hash } = await this.processPassword(createUserData.password);
    const user = await this.userRepository.create({
      name: createUserData.name,
      phone: createUserData.phone,
      password: hash,
      role: Role.CONSUMER,
      isActive: true,
    });

    return plainToInstance(UserResponseDto, user);
  }

  async findWithPassword(phone: string): Promise<User | null> {
    return this.userRepository.findByPhoneWithPassword(phone);
  }

  async healthCheck() {
    return {
      status: 'ok',
      service: 'users',
      timestamp: new Date().toISOString(),
    };
  }

  // ----------------- MÉTODOS PRIVADOS -----------------

  private async verifyUserNotExists(phone: string): Promise<void> {
    const existingUser = await this.userRepository.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('El teléfono ya está registrado');
    }
  }

  private async processPassword(password?: string) {
    const plain = password || this.passwordService.generateRandomPassword(12);
    const hash = await this.passwordService.hashPassword(plain);

    return { plain, hash };
  }

  private async notifyUserWithPassword(phone: string, password: string): Promise<void> {
    this.logger.log(`Notificar al usuario ${phone} con contraseña: ${password}`);
    // Aquí podrías integrar tu servicio real de notificación
  }
}
