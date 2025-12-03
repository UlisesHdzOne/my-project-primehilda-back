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
import type { CreateUserByAdminInput, FindUsersInput } from './types/user.types';

@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================
  // 🔐 ENDPOINTS ADMIN
  // ============================================

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createByAdmin(@Body() dto: CreateUserByAdminDto): Promise<UserResponseDto> {
    // DTO → Type (password opcional)
    const input: CreateUserByAdminInput = {
      name: dto.name,
      phone: dto.phone,
      password: dto.password, // Puede ser undefined, el service lo generará
      role: dto.role,
      isActive: dto.isActive,
    };

    // Llamada al servicio
    const user = await this.usersService.createUserByAdmin(input);

    // Type → DTO
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // ============================================
  // 👤 ENDPOINTS AUTENTICADOS
  // ============================================

  @Get()
  @UseGuards(JwtAuthGuard)
  async findUsers(@Query() queryDto: FindUsersQueryDto): Promise<UsersListResponseDto> {
    const input: FindUsersInput = {
      skip: queryDto.skip,
      take: queryDto.take,
      search: queryDto.search,
      role: queryDto.role,
      isActive: queryDto.isActive,
      orderBy: queryDto.orderBy,
      orderDirection: queryDto.orderDirection,
    };

    const result = await this.usersService.findUsers(input);

    return plainToInstance(UsersListResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard)
  async findByPhone(@Param('phone') phone: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByPhone(phone);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  // ============================================
  // 🏥 HEALTH CHECK
  // ============================================

  @Get('health/check')
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    return this.usersService.healthCheck();
  }
}
