import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import type { IUserRepository } from './user-repository.interface';
import type {
  FindUsersInput,
  UserSafe,
  UserWithPasswordFromRepository,
  CountUsersParams,
  UserCreateInput,
} from '../types/user.types';
import { Role } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  // ========================= BÚSQUEDAS =========================

  async findByPhone(phone: string): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.safeSelect(),
    });
  }

  async findById(id: number): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.safeSelect(),
    });
  }

  async findMany(params: FindUsersInput): Promise<UserSafe[]> {
    const {
      skip = 0,
      take = 10,
      search,
      isActive,
      role,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      where: this.buildWhere({ search, isActive, role }),
      orderBy: { [orderBy]: orderDirection },
      select: this.safeSelect(),
    });
  }

  async count(params: CountUsersParams): Promise<number> {
    return this.prisma.user.count({
      where: this.buildWhere(params),
    });
  }

  async findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  // ========================= CREACIÓN =========================

  async create(data: UserCreateInput): Promise<UserSafe> {
    return this.prisma.user.create({
      data,
      select: this.safeSelect(),
    });
  }

  // ========================= PRIVADOS =========================

  private safeSelect() {
    return {
      id: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  private buildWhere(params: { search?: string; isActive?: boolean; role?: Role }) {
    const { search, isActive, role } = params;

    return {
      AND: [
        isActive !== undefined ? { isActive } : {},
        role ? { role } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
      ],
    };
  }
}
