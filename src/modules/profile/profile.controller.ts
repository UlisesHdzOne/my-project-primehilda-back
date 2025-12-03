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
import { ProfileService } from './profile.service';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { UpdateCompleteProfileDto } from './dto/update-complete-profile.dto';
import { UserWithProfileResponseDto } from './dto/user-with-profile-response.dto';
import { plainToInstance } from 'class-transformer';

@UseInterceptors(ResponseInterceptor)
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  // -----------------------
  // Perfil del usuario actual
  // -----------------------

  @Get()
  async getMyCompleteProfile(@User('id') userId: number) {
    const profile = await this.profileService.getUserWithProfile(userId);
    return plainToInstance(UserWithProfileResponseDto, profile);
  }

  @Put()
  async updateMyCompleteProfile(
    @User('id') userId: number,
    @Body() data: UpdateCompleteProfileDto,
  ) {
    const updatedProfile = await this.profileService.updateMyCompleteProfile(userId, data);
    return plainToInstance(UserWithProfileResponseDto, updatedProfile);
  }

  // -----------------------
  // Administrador gestionando perfiles de otros usuarios
  // -----------------------

  @Get('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUserProfile(@Param('id', ParseIntPipe) userId: number) {
    const profile = await this.profileService.getUserWithProfile(userId);
    return plainToInstance(UserWithProfileResponseDto, profile);
  }

  @Put('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() data: UpdateCompleteProfileDto,
  ) {
    const updatedProfile = await this.profileService.updateMyCompleteProfile(userId, data);
    return plainToInstance(UserWithProfileResponseDto, updatedProfile);
  }
}
