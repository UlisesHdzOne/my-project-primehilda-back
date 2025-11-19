import { Controller, Get, Put, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';
import { PaginationParams } from '../../../shared/interfaces/pagination.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@UserId() userId: number) {
    return this.usersService.findById(userId);
  }

  @Put('profile')
  updateProfile(@UserId() userId: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findPublicById(id);
  }

  @Get()
  getUsers(@Query() pagination: PaginationParams & { search?: string }) {
    return this.usersService.findAllPublic({
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      search: pagination.search,
    });
  }
}
