import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { UserResponseDto } from '../dtos/responses/user-response.dto';
import { UserPublicDto } from '../dtos/responses/user-public.dto';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';
import { hashPassword } from 'src/shared/utils/auth.utils';
import { PaginationParams } from 'src/shared/interfaces/pagination.interface';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.phone);
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const existingPhone = await this.usersRepository.findByPhone(createUserDto.phone);
    if (existingPhone) throw new ConflictException('El teléfono ya está registrado');

    const hashedPassword = await hashPassword(createUserDto.password);

    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return new UserResponseDto(user);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return new UserResponseDto(user);
  }

  async findPublicById(id: number): Promise<UserPublicDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return plainToInstance(UserPublicDto, user, { excludeExtraneousValues: true });
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findByEmail(email);
    return user ? new UserResponseDto(user) : null;
  }

  async findByPhone(phone: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findByPhone(phone);
    return user ? new UserResponseDto(user) : null;
  }

  async findAllPublic(pagination: PaginationParams & { search?: string }) {
    const result = await this.usersRepository.findAll(pagination);
    const users = plainToInstance(UserPublicDto, result.users, { excludeExtraneousValues: true });

    return {
      users,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
        hasNext: pagination.page * pagination.limit < result.total,
        hasPrev: pagination.page > 1,
      },
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) throw new NotFoundException('Usuario no encontrado');

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findByEmail(updateUserDto.email);
      if (emailExists) throw new ConflictException('El email ya está en uso por otro usuario');
    }

    if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
      const phoneExists = await this.usersRepository.findByPhone(updateUserDto.phone);
      if (phoneExists) throw new ConflictException('El teléfono ya está en uso por otro usuario');
    }

    if (updateUserDto.password) updateUserDto.password = await hashPassword(updateUserDto.password);

    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    return new UserResponseDto(updatedUser);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.usersRepository.softDelete(id);
    return { message: 'Usuario eliminado exitosamente' };
  }

  async toggleActive(id: number, isActive: boolean): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updatedUser = await this.usersRepository.toggleActive(id, isActive);
    return new UserResponseDto(updatedUser);
  }
}
