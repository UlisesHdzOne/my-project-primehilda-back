import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from './repositories/user-repository.interface';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async findByPhone(phone: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByPhone(phone);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    return plainToInstance(UserResponseDto, user);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    // ✅ Limpio y consistente
    return plainToInstance(UserResponseDto, user);
  }

  async create(userData: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.create(userData);
    
    // ✅ También aplica para creación
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
}
