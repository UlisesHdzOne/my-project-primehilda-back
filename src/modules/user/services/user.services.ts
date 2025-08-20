
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }
}
