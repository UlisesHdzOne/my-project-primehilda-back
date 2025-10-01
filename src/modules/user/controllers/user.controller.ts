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
import { UserResponseDto } from 'src/modules/auth/dto/user-response.dto';
import { Roles } from 'src/modules/auth/decorators/role.decorators';
import { Role } from 'src/common/constants/role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Crear un nuevo usuario
  @Post('create')
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }

  // Buscar usuario por teléfono
  @Get('search')
  async searchUserByPhone(
    @Query() dto: SearchUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.findUserByPhone(dto.phone);
  }

  // Obtener todos los usuarios
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.getUsers();
  }

  // Obtener usuario por ID
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.userService.getUserById(id);
  }

  // Actualizar usuario
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(id, dto);
  }

  // Eliminar usuario
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.userService.deleteUser(id);
  }
}
