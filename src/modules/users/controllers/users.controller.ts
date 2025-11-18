import { Controller, Get, Put, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';
import { PaginationParams } from '../../../shared/interfaces/pagination.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile') // Mi perfil
  getProfile() {
    return { message: 'Perfil endpoint - agregar autenticación después' };
  }

  @Put('profile') // Actualizar MI perfil
  updateProfile(@Body() updateUserDto: UpdateUserDto) {
    return { message: 'Actualizar perfil - agregar autenticación después' };
  }

  @Get(':id') // Ver perfil de OTRO usuario (solo info pública)
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Get() // Listar usuarios (con paginación)
  getUsers(@Query() pagination: PaginationParams & { search?: string }) {
    return this.usersService.findAll({
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      search: pagination.search,
    });
  }
}
