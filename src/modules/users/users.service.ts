import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { IUserRepository } from './repositories/user-repository.interface';
import { Role, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserByPublicDto } from './dto/create-user-by-public.dto';
import { ConfigService } from '@nestjs/config';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { PasswordService } from '@/common/services/password.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
    private configService: ConfigService,
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
    // Verificar permisos de administrador
    await this.verifyAdminPermissions(adminId);

    // Validar unicidad
    await this.verifyUserNotExists(createUserDto.phone);

    // Procesar contraseña
    const { password, shouldNotify } = await this.processPassword(createUserDto.password);

    const user = await this.userRepository.create({
      name: createUserDto.name,
      phone: createUserDto.phone,
      password,
      role: createUserDto.role || Role.CONSUMER,
      isActive: createUserDto.isActive ?? true,
    });

    // ✅ Opcional: Notificar al usuario si se generó contraseña automática
    if (shouldNotify) {
      await this.notifyUserWithPassword(createUserDto.phone, createUserDto.password!);
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
      role: Role.CONSUMER , // ← Siempre CONSUMER para registro público
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

  private async verifyAdminPermissions(adminId: number): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden crear usuarios');
    }
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
  }> {
    let finalPassword = password;
    let shouldNotify = false;

    if (!finalPassword) {
      finalPassword = this.generateRandomPassword(12);
      shouldNotify = true;
    }

    const hashedPassword = await this.passwordService.hashPassword(finalPassword);

    return {
      password: hashedPassword,
      shouldNotify,
    };
  }

  // ✅ Generar contraseña aleatoria (para admin)
  private generateRandomPassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async notifyUserWithPassword(phone: string, password: string): Promise<void> {
    // ✅ Aquí implementarías la notificación (email, SMS, etc.)
    console.log(`Notificar al usuario ${phone} con contraseña: ${password}`);
    // Ejemplo: await this.emailService.sendWelcomeEmail(phone, password);
  }
}
