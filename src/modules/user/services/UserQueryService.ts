import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { Prisma } from '@prisma/client';

export interface PaginatedUsers {
  data: UserEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class UserQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: string, page = 1, limit = 10): Promise<PaginatedUsers> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, skip, take: limit }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => UserEntity.fromPrisma(user)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findByIdWithAddresses(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    });

    if (!user) return null;

    return UserEntity.fromPrisma(user);
  }
}
