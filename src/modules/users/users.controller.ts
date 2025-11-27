import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '@/common/interfaces/request-user.interface';
import { User } from '@/common/decorators/user.decorator';

@Controller('users')
//@UseGuards(JwtAuthGuard, RolesGuard) // ← Proteger todo el controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ ENDPOINT para que admin cree usuarios
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard) // ← Solo este endpoint requiere ambos guards token y role
  @Roles(Role.ADMIN) // ← Solo administradores
  @UsePipes(new ValidationPipe())
  async createByAdmin(
    @User() user: RequestUser, // ← Request tipado de Express
    @Body() createUserDto: CreateUserByAdminDto,
  ) {
    const newUser = await this.usersService.createUserByAdmin(
      user.id,
      createUserDto,
    );

    return {
      user: newUser,
      message: 'Usuario creado exitosamente por administrador',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // solo JWT ,Cualquier usuario puede acceder autenticado token
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return { user };
  }

  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard) // solo JWT ,Cualquier usuario puede acceder autenticado token
  async findByPhone(@Param('phone') phone: string) {
    const user = await this.usersService.findByPhone(phone);
    return { user };
  }

  @Get('health/check') // ← Salud del servicio publico
  async healthCheck() {
    return this.usersService.healthCheck();
  }
}
