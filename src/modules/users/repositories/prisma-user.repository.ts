import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import type { IUserRepository } from './user-repository.interface';
import type {
  CreateUserInput,
  FindUsersInput,
  UserFromRepository,
  UserWithPasswordFromRepository,
  CountUsersParams,
} from '../types/user.types';
import { Role } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // 🔍 BÚSQUEDAS SIN PASSWORD
  // ============================================

  async findByPhone(phone: string): Promise<UserFromRepository | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.getSafeSelect(),
    });
  }

  async findById(id: number): Promise<UserFromRepository | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.getSafeSelect(),
    });
  }

  async findMany(params: FindUsersInput): Promise<UserFromRepository[]> {
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
      where: this.buildWhereClause({ search, isActive, role }),
      orderBy: {
        [orderBy]: orderDirection,
      },
      select: this.getSafeSelect(),
    });
  }

  async count(params: CountUsersParams): Promise<number> {
    return this.prisma.user.count({
      where: this.buildWhereClause(params),
    });
  }

  // ============================================
  // 🔐 BÚSQUEDA CON PASSWORD (solo auth)
  // ============================================

  async findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      // ✅ Aquí SÍ incluimos password
    });
  }

  // ============================================
  // ✏️ MUTACIONES
  // ============================================

  async create(userData: CreateUserInput): Promise<UserFromRepository> {
    return this.prisma.user.create({
      data: userData,
      select: this.getSafeSelect(),
    });
  }

  // ============================================
  // 🔧 MÉTODOS PRIVADOS
  // ============================================

  /**
   * Select seguro - SIN password
   */
  private getSafeSelect() {
    return {
      id: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // password: false (implícito)
    } as const;
  }

  /**
   * Construye cláusula WHERE para búsquedas
   */
  private buildWhereClause(params: { search?: string; isActive?: boolean; role?: Role }) {
    const { search, isActive, role } = params;

    return {
      AND: [
        // Filtro por estado activo
        isActive !== undefined ? { isActive } : {},

        // Filtro por rol
        role ? { role } : {},

        // Búsqueda por nombre o teléfono
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
