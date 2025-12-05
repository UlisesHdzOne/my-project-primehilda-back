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

@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createByAdmin(@Body() dto: CreateUserByAdminDto) {
    const user = await this.usersService.createUserByAdmin(dto);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findUsers(@Query() query: FindUsersQueryDto) {
    const result = await this.usersService.findUsers(query);
    return plainToInstance(UsersListResponseDto, result, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard)
  async findByPhone(@Param('phone') phone: string) {
    const user = await this.usersService.findByPhone(phone);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Get('health/check')
  async healthCheck() {
    return this.usersService.healthCheck();
  }
}
