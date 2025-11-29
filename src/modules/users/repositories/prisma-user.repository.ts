import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateUserData, FindManyParams, IUserRepository } from './user-repository.interface';
import { User } from '@prisma/client';
import { UserSafe } from '../types/user-safe.type';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  // ✅ NUEVO MÉTODO - Para LOGIN/AUTH
  async findByPhoneWithPassword(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      // ← SIN select (trae TODOS los campos, INCLUYENDO password)
    });
  }

  async findByPhone(phone: string): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { phone },
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

  async findById(id: number): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { id },
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

  async create(userData: CreateUserData): Promise<UserSafe> {
    return this.prisma.user.create({
      data: userData,
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
