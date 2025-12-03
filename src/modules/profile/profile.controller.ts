// ============================================
// 📁 src/modules/profile/profile.controller.ts
// ============================================

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { ProfileService } from './profile.service';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';

// DTOs
import { UpdateCompleteProfileDto } from './dto/update-complete-profile.dto';
import { UserWithProfileResponseDto } from './dto/user-with-profile-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

// Types
import type { UpdateCompleteProfileInput } from './types/profile.types';

@UseInterceptors(ResponseInterceptor)
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  // ============================================
  // 👤 PERFIL DEL USUARIO ACTUAL
  // ============================================

  /**
   * GET /profile
   * Obtener mi perfil completo
   */
  @Get()
  async getMyCompleteProfile(@User('id') userId: number): Promise<UserWithProfileResponseDto> {
    const profile = await this.profileService.getUserWithProfile(userId);

    return plainToInstance(UserWithProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * PUT /profile
   * Actualizar mi perfil completo
   */
  @Put()
  async updateMyCompleteProfile(
    @User('id') userId: number,
    @Body() dto: UpdateCompleteProfileDto,
  ): Promise<UserWithProfileResponseDto> {
    // ✅ Conversión DTO → Type
    const input: UpdateCompleteProfileInput = {
      name: dto.name,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    };

    const updatedProfile = await this.profileService.updateMyCompleteProfile(userId, input);

    return plainToInstance(UserWithProfileResponseDto, updatedProfile, {
      excludeExtraneousValues: true,
    });
  }

  // ============================================
  // 🔍 VER PERFILES DE OTROS USUARIOS
  // ============================================

  /**
   * GET /profile/user/:id
   * Ver perfil público de otro usuario
   */
  @Get('user/:id')
  async getUserPublicProfile(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<ProfileResponseDto | { message: string }> {
    const profile = await this.profileService.getPublicProfile(userId);

    if (!profile) {
      return { message: 'El usuario no tiene perfil público' };
    }

    return plainToInstance(ProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  // ============================================
  // 🔐 ADMINISTRADOR GESTIONANDO PERFILES
  // ============================================

  /**
   * GET /profile/users/:id
   * Admin: Ver perfil completo de cualquier usuario
   */
  @Get('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUserProfile(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserWithProfileResponseDto> {
    const profile = await this.profileService.getUserWithProfile(userId);

    return plainToInstance(UserWithProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * PUT /profile/users/:id
   * Admin: Actualizar perfil de cualquier usuario
   */
  @Put('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: UpdateCompleteProfileDto,
  ): Promise<UserWithProfileResponseDto> {
    // ✅ Conversión DTO → Type
    const input: UpdateCompleteProfileInput = {
      name: dto.name,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    };

    const updatedProfile = await this.profileService.updateMyCompleteProfile(userId, input);

    return plainToInstance(UserWithProfileResponseDto, updatedProfile, {
      excludeExtraneousValues: true,
    });
  }
}
