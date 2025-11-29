import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateUserData, FindManyParams, IUserRepository } from './user-repository.interface';
import { User } from '@prisma/client';
import { UserSafe } from './types/user-safe.type';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      return this.prisma.user.create({
        data: userData,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('El telefono ya esta registrado');
      }
      throw error;
    }
  }

  async findMany(params: FindManyParams): Promise<UserSafe[]> {
    const {
      skip,
      take,
      search,
      isActive,
      role,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      where: {
        AND: [
          isActive !== undefined ? { isActive } : {},
          role ? { role } : {},
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { phone: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      orderBy: {
        [orderBy]: orderDirection,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
