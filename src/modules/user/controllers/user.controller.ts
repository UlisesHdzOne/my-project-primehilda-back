import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Roles } from 'src/modules/auth/decorators/role.decorators';
import { Role } from 'src/common/constants/role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserEntity } from '../entities/user.entity';
import { UserQueryDto } from '../dto/UserQueryDto';
import { PaginatedUsers, UserQueryService } from '../services/UserQueryService';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryService: UserQueryService,
  ) {}

  // Crear un nuevo usuario
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(dto);
  }

  // Obtener usuarios con búsqueda y paginación
  @Get()
  async getUsers(@Query() query: UserQueryDto): Promise<PaginatedUsers> {
    const { q, page = 1, limit = 10 } = query;
    return this.userQueryService.findAll(q, page, limit);
  }

  // Actualizar usuario
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUser(id, dto);
  }

  // Eliminar usuario
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userService.deleteUser(id);
  }

  // Usuario con direcciones (detalle completo)
  @Get(':id/addresses')
  async findOneWithAddresses(@Param('id', ParseIntPipe) id: number) {
    return this.userQueryService.findByIdWithAddresses(id);
  }
}
