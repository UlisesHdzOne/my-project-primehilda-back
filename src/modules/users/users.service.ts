import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { IUserRepository } from './repositories/user-repository.interface';
import { PasswordService } from '@/common/services/password.service';

import type {
  UserOutput,
  UsersListOutput,
  UserListItem,
  CreateUserInput,
  FindUsersInput,
  UserWithPasswordFromRepository,
} from './types/user.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
    private passwordService: PasswordService,
  ) {}

  // ============================================
  // 🔍 BÚSQUEDAS
  // ============================================

  /**
   * Buscar usuario por teléfono
   * ✅ Sin conversión - el repo devuelve UserFromRepository === UserOutput
   */
  async findByPhone(phone: string): Promise<UserOutput> {
    const user = await this.userRepository.findByPhone(phone);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // ✅ No necesitamos conversión, UserFromRepository === UserOutput
    return user;
  }

  /**
   * Buscar usuario por ID
   * ✅ Sin conversión innecesaria
   */
  async findById(id: number): Promise<UserOutput> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Buscar usuarios con filtros y paginación
   * ✅ Aquí SÍ transformamos porque queremos UserListItem (más compacto)
   */
  async findUsers(params: FindUsersInput): Promise<UsersListOutput> {
    const users = await this.userRepository.findMany(params);
    const total = await this.userRepository.count({
      search: params.search,
      role: params.role,
      isActive: params.isActive,
    });

    // ✅ Transformación válida: UserFromRepository[] → UserListItem[]
    const userList: UserListItem[] = users.map(user => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
    }));

    const pageSize = params.take ?? 10;
    const currentPage = Math.floor((params.skip ?? 0) / pageSize) + 1;

    return {
      users: userList,
      total,
      page: currentPage,
      pageSize,
    };
  }

  // ============================================
  // ✏️ CREACIÓN DE USUARIOS
  // ============================================

  /**
   * Crear usuario por administrador
   * Puede generar contraseña automática si no se proporciona
   */
  async createUserByAdmin(data: CreateUserInput): Promise<UserOutput> {
    // 1. Validar que no existe
    await this.ensurePhoneNotTaken(data.phone);

    // 2. Procesar contraseña
    const { plainPassword, hashedPassword } = await this.processPassword(data.password);

    // 3. Crear usuario
    const input: CreateUserInput = {
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: data.role ?? Role.CONSUMER,
      isActive: data.isActive ?? true,
    };

    const user = await this.userRepository.create(input);

    // 4. Si se generó contraseña, notificar
    if (!data.password) {
      this.notifyUserWithPassword(data.phone, plainPassword);
    }

    // ✅ No necesitamos conversión
    return user;
  }

  /**
   * Crear usuario público (registro)
   */
  async createUserPublic(data: CreateUserInput): Promise<UserOutput> {
    await this.ensurePhoneNotTaken(data.phone);

    const hashedPassword = await this.passwordService.hashPassword(data.password);

    const input: CreateUserInput = {
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: Role.CONSUMER,
      isActive: true,
    };

    // ✅ No necesitamos conversión
    return this.userRepository.create(input);
  }

  // ============================================
  // 🔐 AUTENTICACIÓN
  // ============================================

  /**
   * Buscar usuario con password (solo para login)
   * ⚠️ Este método SÍ devuelve un tipo diferente (con password)
   */
  async findWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null> {
    return this.userRepository.findByPhoneWithPassword(phone);
  }

  // ============================================
  // 🔧 MÉTODOS PRIVADOS
  // ============================================

  /**
   * Valida que el teléfono no esté registrado
   */
  private async ensurePhoneNotTaken(phone: string): Promise<void> {
    const existingUser = await this.userRepository.findByPhone(phone);

    if (existingUser) {
      throw new ConflictException('El teléfono ya está registrado');
    }
  }

  /**
   * Procesa la contraseña: genera si no existe, hashea
   */
  private async processPassword(
    password?: string,
  ): Promise<{ plainPassword: string; hashedPassword: string }> {
    const plainPassword = password || this.passwordService.generateRandomPassword(12);
    const hashedPassword = await this.passwordService.hashPassword(plainPassword);

    return { plainPassword, hashedPassword };
  }

  /**
   * Notifica al usuario su contraseña generada
   * TODO: Implementar envío de email/SMS
   */
  private notifyUserWithPassword(phone: string, password: string): void {
    this.logger.log(`🔐 Contraseña generada para ${phone}: ${password}`);
    // TODO: Enviar por email/SMS
  }

  // ============================================
  // 🏥 HEALTH CHECK
  // ============================================

  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    return {
      status: 'ok',
      service: 'users',
      timestamp: new Date().toISOString(),
    };
  }
}
