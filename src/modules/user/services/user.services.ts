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

  async getUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateUser(id: number, dto: Partial<CreateUserDto>) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
