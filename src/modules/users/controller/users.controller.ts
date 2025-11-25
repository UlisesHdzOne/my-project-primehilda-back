import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../service/users.service';
import { UserResponseDto } from '../dto/response/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Crear usuario
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.createUser(createUserDto);
    return plainToInstance(UserResponseDto, user);
  }

  // Listar todos los usuarios
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.getAllUsers();
    return users.map(u => plainToInstance(UserResponseDto, u));
  }

  // Obtener usuario por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.usersService.getUserById(id);
    return plainToInstance(UserResponseDto, user);
  }

  // Obtener usuario con sus reservas
  @Get(':id/reservas')
  async findOneWithReservations(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto & { reservas: any[] }> {
    const userWithReservations = await this.usersService.getUserWithReservations(id);
    return plainToInstance(UserResponseDto, userWithReservations) as UserResponseDto & {
      reservas: any[];
    };
  }

  // Actualizar usuario
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  // Eliminar usuario
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
