import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { IUserRepository } from './repositories/user-repository.interface';
import { Role } from '@prisma/client';
import { CreateUserByPublicDto } from './dto/create-user-by-public.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { PasswordService } from '@/common/services/password.service';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserOutput } from './types/user.output.type';
import { CreateUserInput, FindUsersInput } from './types/user.input.type';
import { UserFromRepo, UserWithPasswordFromRepo } from './types/user.repo.type';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
    private passwordService: PasswordService,
  ) {}

  // ---------- MÉTODOS PÚBLICOS ----------

  async findByPhone(phone: string): Promise<UserOutput> {
    const user = await this.userRepository.findByPhone(phone);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.toUserOutput(user);
  }

  async findUsers(params: FindUsersQueryDto): Promise<UserOutput[]> {
    const input: FindUsersInput = {
      skip: params.skip,
      take: params.take,
      search: params.search,
      role: params.role,
      isActive: params.isActive,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };

    const users = await this.userRepository.findMany(input);
    return users.map(user => this.toUserOutput(user));
  }

  async findById(id: number): Promise<UserOutput> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.toUserOutput(user);
  }

  // Creación por administrador
  async createUserByAdmin(createUserDto: CreateUserByAdminDto): Promise<UserOutput> {
    await this.verifyUserNotExists(createUserDto.phone);

    const { plain, hash } = await this.processPassword(createUserDto.password);

    const input: CreateUserInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: hash,
      role: createUserDto.role || Role.CONSUMER,
      isActive: createUserDto.isActive ?? true,
    };

    const user = await this.userRepository.create(input);

    // Notificar si no se proporcionó contraseña
    if (!createUserDto.password) {
      await this.notifyUserWithPassword(createUserDto.phone, plain);
    }

    return this.toUserOutput(user);
  }

  // Creación pública
  async createUserPublic(createUserData: CreateUserByPublicDto): Promise<UserOutput> {
    await this.verifyUserNotExists(createUserData.phone);

    const { hash } = await this.processPassword(createUserData.password);

    const input: CreateUserInput = {
      name: createUserData.name,
      phone: createUserData.phone,
      password: hash,
      role: Role.CONSUMER,
      isActive: true,
    };

    const user = await this.userRepository.create(input);
    return this.toUserOutput(user);
  }

  async findWithPassword(phone: string): Promise<UserWithPasswordFromRepo | null> {
    return this.userRepository.findByPhoneWithPassword(phone);
  }

  async healthCheck() {
    return {
      status: 'ok',
      service: 'users',
      timestamp: new Date().toISOString(),
    };
  }

  // ---------- MÉTODOS PRIVADOS ----------

  private toUserOutput(user: UserFromRepo): UserOutput {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

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
  }
}
