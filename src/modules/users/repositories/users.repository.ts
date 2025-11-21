import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { PaginationParams } from '../../../shared/interfaces/pagination.interface';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';

interface PrismaUser {
  id: number;
  name: string;
  lastName: string;
  email: string | null;
  password: string;
  phone: string;
  role: string;
  document: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toUserEntity(user: PrismaUser): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email || undefined,
      password: user.password,
      phone: user.phone,
      role: user.role,
      document: user.document || undefined,
      notes: user.notes || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async create(createUserDto: CreateUserDto & { password: string }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return this.toUserEntity(user as PrismaUser);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.toUserEntity(user as PrismaUser) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.toUserEntity(user as PrismaUser) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    return user ? this.toUserEntity(user as PrismaUser) : null;
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
      users: users.map(user => this.toUserEntity(user as PrismaUser)),
      total,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return this.toUserEntity(user as PrismaUser);
  }

  async softDelete(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return this.toUserEntity(user as PrismaUser);
  }

  async toggleActive(id: number, isActive: boolean): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
    return this.toUserEntity(user as PrismaUser);
  }
}
