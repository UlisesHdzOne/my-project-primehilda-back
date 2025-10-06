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
import { SearchUserDto } from '../dto/search-user.dto';
import { Roles } from 'src/modules/auth/decorators/role.decorators';
import { Role } from 'src/common/constants/role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Crear un nuevo usuario (POST /users)
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(dto);
  }

  // Buscar usuario por teléfono (GET /users/search?phone=...)
  @Get('search')
  async searchUserByPhone(@Query() dto: SearchUserDto): Promise<UserEntity> {
    return this.userService.findUserByPhone(dto.phone);
  }

  // Obtener todos los usuarios (GET /users)
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return this.userService.getUsers();
  }

  // Obtener usuario por ID (GET /users/:id)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userService.getUserById(id);
  }

  // Actualizar usuario (PATCH /users/:id)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUser(id, dto);
  }

  // Eliminar usuario (DELETE /users/:id)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userService.deleteUser(id);
  }
}
