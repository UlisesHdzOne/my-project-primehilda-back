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

@UseInterceptors(ResponseInterceptor)
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  // -----------------------
  // Perfil del usuario actual
  // -----------------------

  @Get()
  getMyCompleteProfile(@User('id') userId: number) {
    return this.profileService.getUserWithProfile(userId);
  }

  @Put()
  updateMyCompleteProfile(@User('id') userId: number, @Body() data: UpdateCompleteProfileDto) {
    return this.profileService.updateMyCompleteProfile(userId, data);
  }

  // -----------------------
  // Administrador gestionando perfiles de otros usuarios
  // -----------------------

  @Get('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getUserProfile(@Param('id', ParseIntPipe) userId: number) {
    return this.profileService.getUserWithProfile(userId);
  }

  @Put('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateUserProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() data: UpdateCompleteProfileDto,
  ) {
    return this.profileService.updateMyCompleteProfile(userId, data);
  }
}
