import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../services/user.services';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /users/register
  @Post('register')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
  //GET /users
  @Get()
  async findAll() {
    return this.userService.getUsers();
  }
}
