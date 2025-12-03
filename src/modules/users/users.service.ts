import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { IUserRepository } from './repositories/user-repository.interface';
import { PasswordService } from '@/common/services/password.service';
import type {
  UserListItem,
  FindUsersInput,
  UserWithPasswordFromRepository,
  CreateUserByAdminInput,
  UserCreateInput,
  CreateUserPublicInput,
  UserSafe,
  UsersListOutput,
} from './types/user.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('USER_REPOSITORY') private userRepository: IUserRepository,
    private passwordService: PasswordService,
  ) {}

  // ========================= BÚSQUEDAS =========================
  async findByPhone(phone: string): Promise<UserSafe> {
    const user = await this.userRepository.findByPhone(phone);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findById(id: number): Promise<UserSafe> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findUsers(params: FindUsersInput): Promise<UsersListOutput> {
    const users = await this.userRepository.findMany(params);
    const total = await this.userRepository.count({
      search: params.search,
      role: params.role,
      isActive: params.isActive,
    });
    const pageSize = params.take ?? 10;
    const currentPage = Math.floor((params.skip ?? 0) / pageSize) + 1;
    const userList: UserListItem[] = users.map(u => ({ id: u.id, name: u.name, phone: u.phone }));
    return { users: userList, total, page: currentPage, pageSize };
  }

  // ========================= CREACIÓN =========================
  async createUserByAdmin(data: CreateUserByAdminInput): Promise<UserSafe> {
    await this.ensurePhoneNotTaken(data.phone);
    const { plainPassword, hashedPassword } = await this.processPassword(data.password);
    const input: UserCreateInput = {
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: data.role ?? Role.CONSUMER,
      isActive: data.isActive ?? true,
    };
    const user = await this.userRepository.create(input);
    if (!data.password) this.notifyUserWithPassword(data.phone, plainPassword);
    return user;
  }

  async createUserPublic(data: CreateUserPublicInput): Promise<UserSafe> {
    await this.ensurePhoneNotTaken(data.phone);
    const hashedPassword = await this.passwordService.hashPassword(data.password);
    const input: UserCreateInput = {
      ...data,
      password: hashedPassword,
      role: Role.CONSUMER,
      isActive: true,
    };
    return this.userRepository.create(input);
  }

  // ========================= AUTENTICACIÓN =========================
  async findWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null> {
    return this.userRepository.findByPhoneWithPassword(phone);
  }

  // ========================= PRIVADOS =========================
  private async ensurePhoneNotTaken(phone: string): Promise<void> {
    const existingUser = await this.userRepository.findByPhone(phone);
    if (existingUser) throw new ConflictException('El teléfono ya está registrado');
  }

  private async processPassword(password?: string) {
    const plainPassword = password || this.passwordService.generateRandomPassword(12);
    const hashedPassword = await this.passwordService.hashPassword(plainPassword);
    return { plainPassword, hashedPassword };
  }

  private notifyUserWithPassword(phone: string, password: string): void {
    this.logger.log(`🔐 Contraseña generada para ${phone}: ${password}`);
  }

  // ========================= HEALTH CHECK =========================
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    return { status: 'ok', service: 'users', timestamp: new Date().toISOString() };
  }
}
