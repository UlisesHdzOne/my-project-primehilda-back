import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.services';
import { CreateUserDto } from '../dto/create-user.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt.guard';
import { Roles } from 'src/modules/auth/decorators/role.decorators';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  validateEmailUpdate,
  validateUserEmailUnique,
  validateUserExists,
} from '../utils/user.validator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  // POST /users/create
  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    await validateUserEmailUnique(dto.email, this.prisma);
    return this.userService.createUser(dto);
  }
  //GET /users
  @Get()
  async findAll() {
    return this.userService.getUsers();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number) {
    await validateUserExists(id, this.prisma);
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    await validateUserExists(id, this.prisma);

    if (dto.email) {
      await validateEmailUpdate(id, dto.email, this.prisma);
    }

    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await validateUserExists(id, this.prisma);
    return this.userService.deleteUser(id);
  }
}
