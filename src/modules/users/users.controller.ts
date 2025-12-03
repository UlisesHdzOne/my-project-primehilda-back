// ============================================
// 📁 src/modules/users/users.controller.ts
// ============================================

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { Role } from '@prisma/client';

// DTOs
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';

// Types
import type { CreateUserInput, FindUsersInput } from './types/user.types';

@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================
  // 🔐 ENDPOINTS ADMIN
  // ============================================

  /**
   * POST /users/admin/create
   * Crear usuario (solo admin)
   *
   * FLUJO:
   * 1. DTO valida los datos de entrada
   * 2. Controller convierte DTO → Type
   * 3. Service procesa y retorna Type
   * 4. Controller serializa Type → DTO
   */
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createByAdmin(@Body() dto: CreateUserByAdminDto): Promise<UserResponseDto> {
    // ✅ Conversión DTO → Type (adaptador)
    const input: CreateUserInput = {
      name: dto.name,
      phone: dto.phone,
      password: dto.password ?? '', // El service genera si es vacío
      role: dto.role,
      isActive: dto.isActive,
    };

    // ✅ Llamada al servicio (trabaja con types)
    const user = await this.usersService.createUserByAdmin(input);

    // ✅ Serialización Type → DTO
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // ============================================
  // 👤 ENDPOINTS AUTENTICADOS
  // ============================================

  /**
   * GET /users
   * Listar usuarios con filtros
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findUsers(@Query() queryDto: FindUsersQueryDto): Promise<UsersListResponseDto> {
    // ✅ Conversión DTO → Type
    const input: FindUsersInput = {
      skip: queryDto.skip,
      take: queryDto.take,
      search: queryDto.search,
      role: queryDto.role,
      isActive: queryDto.isActive,
      orderBy: queryDto.orderBy,
      orderDirection: queryDto.orderDirection,
    };

    // ✅ Llamada al servicio
    const result = await this.usersService.findUsers(input);

    // ✅ Serialización Type → DTO
    return plainToInstance(UsersListResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * GET /users/:id
   * Obtener usuario por ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * GET /users/phone/:phone
   * Buscar por teléfono
   */
  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard)
  async findByPhone(@Param('phone') phone: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByPhone(phone);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // ============================================
  // 🏥 HEALTH CHECK
  // ============================================

  @Get('health/check')
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    return this.usersService.healthCheck();
  }
}
