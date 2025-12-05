import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import type { IUserRepository } from './user-repository.interface';
import type {
  FindUsersInput,
  UserResponse,
  UserListResponse,
  UserWithPasswordFromRepository,
  CountUsersParams,
  UserCreateInput,
} from '../types/user.types';
import { Role } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string): Promise<UserResponse | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.detailSelect(),
    });
  }

  async findById(id: number): Promise<UserResponse | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.detailSelect(),
    });
  }

  async findMany(params: FindUsersInput): Promise<UserListResponse[]> {
    return this.prisma.user.findMany({
      skip: params.skip ?? 0,
      take: params.take ?? 10,
      where: this.buildWhere(params),
      orderBy: { [params.orderBy ?? 'createdAt']: params.orderDirection ?? 'desc' },
      select: this.listSelect(),
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
      select: {
        id: true,
        name: true,
        phone: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: UserCreateInput): Promise<UserResponse> {
    return this.prisma.user.create({
      data,
      select: this.detailSelect(),
    });
  }

  private detailSelect() {
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

  private listSelect() {
    return {
      id: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
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
