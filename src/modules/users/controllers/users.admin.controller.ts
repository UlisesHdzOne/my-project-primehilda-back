import { Controller, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/shared/constants';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post() // Crear cualquier usuario
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id') // Actualizar CUALQUIER usuario
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id') // Eliminar usuarios
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put(':id/status') // Activar/desactivar usuarios
  toggleUserStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.usersService.toggleActive(id, isActive);
  }
}
