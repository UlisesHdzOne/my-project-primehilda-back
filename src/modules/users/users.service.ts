import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IUserRepository } from './repositories/user-repository.interface';
import { Role, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserByPublicDto } from './dto/create-user-by-public.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { PasswordService } from '@/common/services/password.service';

@Injectable()
export class UsersService {
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

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return plainToInstance(UserResponseDto, user);
  }

  // ✅ Creación por administrador optimizada
  async createUserByAdmin(
    adminId: number,
    createUserDto: CreateUserByAdminDto,
  ): Promise<UserResponseDto> {
    await this.verifyUserNotExists(createUserDto.phone);

    // Procesar contraseña
    const {
      password: hashedPassword,
      shouldNotify,
      plainPassword,
    } = await this.processPassword(createUserDto.password);

    const user = await this.userRepository.create({
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: hashedPassword,
      role: createUserDto.role || Role.CONSUMER,
      isActive: createUserDto.isActive ?? true,
    });

    // ✅ Notificar con la contraseña generada (si aplica)
    if (shouldNotify && plainPassword) {
      await this.notifyUserWithPassword(createUserDto.phone, plainPassword);
    }

    return plainToInstance(UserResponseDto, user);
  }

  // ✅ Creación pública optimizada
  async createUserPublic(createUserData: CreateUserByPublicDto): Promise<UserResponseDto> {
    // Validar que el usuario no existe
    await this.verifyUserNotExists(createUserData.phone);

    const hashedPassword = await this.passwordService.hashPassword(createUserData.password);

    const user = await this.userRepository.create({
      name: createUserData.name,
      phone: createUserData.phone,
      password: hashedPassword,
      role: Role.CONSUMER, // ← Siempre CONSUMER para registro público
      isActive: true, // ← Siempre activo para registro público
    });

    return plainToInstance(UserResponseDto, user);
  }

  // Método interno (no expuesto via HTTP) para auth
  async findWithPassword(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
  }

  // Health check del servicio
  async healthCheck() {
    return {
      status: 'ok',
      service: 'users',
      timestamp: new Date().toISOString(),
    };
  }

  private async verifyUserNotExists(phone: string): Promise<void> {
    const existingUser = await this.userRepository.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('El teléfono ya está registrado');
    }
  }

  private async processPassword(password?: string): Promise<{
    password: string;
    shouldNotify: boolean;
    plainPassword?: string; // Para usar en notificaciones
  }> {
    const shouldNotify = !password;
    const finalPassword = password || this.passwordService.generateRandomPassword(12);

    const hashedPassword = await this.passwordService.hashPassword(finalPassword);

    return {
      password: hashedPassword,
      shouldNotify,
      plainPassword: shouldNotify ? finalPassword : undefined,
    };
  }

  private async notifyUserWithPassword(phone: string, password: string): Promise<void> {
    // ✅ Usar el password real que se generó
    console.log(`Notificar al usuario ${phone} con contraseña: ${password}`);

    // Ejemplo de implementación real:
    // if (this.configService.get('app.notifications.sendPasswordOnCreate')) {
    //   await this.notificationService.sendSMS(phone, `Su contraseña temporal es: ${password}`);
    // }
  }
}
