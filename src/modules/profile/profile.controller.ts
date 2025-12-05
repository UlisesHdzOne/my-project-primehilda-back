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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

// DTOs
import { UpdateCompleteProfileDto } from './dto/update-complete-profile.dto';
import { UserWithProfileResponseDto } from './dto/user-with-profile-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

// Types
import type { UpdateCompleteProfileInput } from './types/profile.types';

@UseInterceptors(ResponseInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ============================================
  // 👤 PERFIL DEL USUARIO ACTUAL
  // ============================================

  @Get()
  async getMyCompleteProfile(@User('id') userId: number) {
    const profile = await this.profileService.getUserWithProfile(userId);
    return plainToInstance(UserWithProfileResponseDto, profile, { excludeExtraneousValues: true });
  }

  @Put()
  async updateMyCompleteProfile(@User('id') userId: number, @Body() dto: UpdateCompleteProfileDto) {
    const input: UpdateCompleteProfileInput = { ...dto };
    const updatedProfile = await this.profileService.updateMyCompleteProfile(userId, input);
    return plainToInstance(UserWithProfileResponseDto, updatedProfile, {
      excludeExtraneousValues: true,
    });
  }

  // ============================================
  // 🔍 PERFIL PÚBLICO DE OTROS USUARIOS
  // ============================================

  @Get('user/:id')
  async getUserPublicProfile(@Param('id', ParseIntPipe) userId: number) {
    const profile = await this.profileService.getPublicProfile(userId);
    if (!profile) return { message: 'El usuario no tiene perfil público' };
    return plainToInstance(ProfileResponseDto, profile, { excludeExtraneousValues: true });
  }

  // ============================================
  // 🔐 ADMINISTRADOR GESTIONANDO PERFILES
  // ============================================

  @Get('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUserProfile(@Param('id', ParseIntPipe) userId: number) {
    const profile = await this.profileService.getUserWithProfile(userId);
    return plainToInstance(UserWithProfileResponseDto, profile, { excludeExtraneousValues: true });
  }

  @Put('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: UpdateCompleteProfileDto,
  ) {
    const input: UpdateCompleteProfileInput = { ...dto };
    const updatedProfile = await this.profileService.updateMyCompleteProfile(userId, input);
    return plainToInstance(UserWithProfileResponseDto, updatedProfile, {
      excludeExtraneousValues: true,
    });
  }
}
