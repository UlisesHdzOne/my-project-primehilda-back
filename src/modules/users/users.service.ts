import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { IUserRepository } from './repositories/user-repository.interface';
import { PasswordService } from '@/common/services/password.service';
import type {
  CreateUserByAdminInput,
  UserCreateInput,
  CreateUserPublicInput,
  UserWithPasswordFromRepository,
  FindUsersInput,
  UserResponse,
  UsersListOutput,
} from './types/user.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private userCache = new Map<number, UserResponse>();
  private phoneCache = new Map<string, UserResponse>();

  constructor(
    @Inject('USER_REPOSITORY') private repo: IUserRepository,
    private passwordService: PasswordService,
  ) {}

  async findById(id: number) {
    if (this.userCache.has(id)) return this.userCache.get(id)!;
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    this.userCache.set(id, user);
    this.phoneCache.set(user.phone, user);
    return user;
  }

  async findByPhone(phone: string) {
    if (this.phoneCache.has(phone)) return this.phoneCache.get(phone)!;
    const user = await this.repo.findByPhone(phone);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    this.userCache.set(user.id, user);
    this.phoneCache.set(phone, user);
    return user;
  }

  private clearCache(user: UserResponse) {
    this.userCache.delete(user.id);
    this.phoneCache.delete(user.phone);
  }

  async findUsers(params: FindUsersInput): Promise<UsersListOutput> {
    const users = await this.repo.findMany(params); // UserListSafe[]
    const total = await this.repo.count(params);

    const pageSize = params.take ?? 10;
    const page = Math.floor((params.skip ?? 0) / pageSize) + 1;

    return { users, total, page, pageSize };
  }

  async createUserByAdmin(data: CreateUserByAdminInput) {
    await this.ensurePhoneNotTaken(data.phone);
    const { plainPassword, hashedPassword } = await this.processPassword(data.password);
    const input: UserCreateInput = {
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
      role: data.role ?? Role.CONSUMER,
    };
    const user = await this.repo.create(input);
    this.clearCache(user);
    if (!data.password) this.notifyUserWithPassword(data.phone, plainPassword);
    return user;
  }

  async createUserPublic(data: CreateUserPublicInput) {
    await this.ensurePhoneNotTaken(data.phone);
    const hashed = await this.passwordService.hashPassword(data.password);
    const input: UserCreateInput = {
      ...data,
      password: hashed,
      role: Role.CONSUMER,
    };
    const user = await this.repo.create(input);
    this.clearCache(user);
    return user;
  }

  async findWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null> {
    return this.repo.findByPhoneWithPassword(phone);
  }

  private async ensurePhoneNotTaken(phone: string) {
    const exists = await this.repo.findByPhone(phone);
    if (exists) throw new ConflictException('El teléfono ya está registrado');
  }

  private async processPassword(password?: string) {
    const plain = password || this.passwordService.generateRandomPassword(12);
    const hashed = await this.passwordService.hashPassword(plain);
    return { plainPassword: plain, hashedPassword: hashed };
  }

  private notifyUserWithPassword(phone: string, password: string) {
    this.logger.log(`Contraseña generada para ${phone}: ${password}`);
  }

  async healthCheck() {
    return { status: 'ok', service: 'users', timestamp: new Date().toISOString() };
  }
}
