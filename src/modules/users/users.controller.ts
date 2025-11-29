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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '@/common/decorators/user.decorator';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@UseInterceptors(ResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -------------------- ENDPOINTS ADMIN --------------------
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe())
  async createByAdmin(@Body() createUserDto: CreateUserByAdminDto) {
    const newUser = await this.usersService.createUserByAdmin(createUserDto);
    return {
      user: newUser,
      message: 'Usuario creado exitosamente por administrador',
    };
  }

  // -------------------- ENDPOINTS PÚBLICOS / AUTENTICADOS --------------------
  @Get('health/check')
  async healthCheck() {
    return this.usersService.healthCheck();
  }

  @UseGuards(JwtAuthGuard)
  @Get() // ← ahora GET /users
  @UsePipes(new ValidationPipe({ transform: true }))
  async findUsers(@Query() query: FindUsersQueryDto) {
    const users = await this.usersService.findUsers(query);
    return { users };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@User('id') userId: number) {
    const user = await this.usersService.findById(userId);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    const user = await this.usersService.findByPhone(phone);
    return { user };
  }

  // -------------------- RUTAS DINÁMICAS --------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return { user };
  }
}
