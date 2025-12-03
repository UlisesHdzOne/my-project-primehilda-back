import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IUserRepository } from './user-repository.interface';
import { UserFromRepo, UserWithPasswordFromRepo } from '../types/user.repo.type';
import { CreateUserInput, FindUsersInput } from '../types/user.input.type';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepo | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findByPhone(phone: string): Promise<UserFromRepo | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.getSafeSelect(),
    });
  }

  async findById(id: number): Promise<UserFromRepo | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.getSafeSelect(),
    });
  }

  async create(userData: CreateUserInput): Promise<UserFromRepo> {
    return this.prisma.user.create({
      data: userData,
      select: this.getSafeSelect(),
    });
  }

  async findMany(params: FindUsersInput): Promise<UserFromRepo[]> {
    const {
      skip = 0, // Valor por defecto
      take = 10, // Valor por defecto
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
      select: this.getSafeSelect(),
    });
  }

  private getSafeSelect() {
    return {
      id: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
