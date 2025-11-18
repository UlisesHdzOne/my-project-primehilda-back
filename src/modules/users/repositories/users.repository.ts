import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { PaginationParams } from '../../../shared/interfaces/pagination.interface';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto & { password: string }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return new UserEntity(user);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? new UserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? new UserEntity(user) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    return user ? new UserEntity(user) : null;
  }

  async findAll(pagination: PaginationParams & { search?: string }): Promise<{
    users: UserEntity[];
    total: number;
  }> {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => new UserEntity(user)),
      total,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return new UserEntity(user);
  }

  async softDelete(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return new UserEntity(user);
  }

  async toggleActive(id: number, isActive: boolean): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
    return new UserEntity(user);
  }
}
