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
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt.guard';
import { Roles } from 'src/modules/auth/decorators/role.decorators';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /users/create
  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('search')
  async searchUserByPhone(@Query('phone') phone: string) {
    return this.userService.findUserByPhone(phone);
  }

  //GET /users
  @Get()
  async findAll() {
    return this.userService.getUsers();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
