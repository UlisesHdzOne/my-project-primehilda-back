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

  // ============================================
  // 🔍 BÚSQUEDAS
  // ============================================

  /** Buscar usuario por teléfono (sin password) */
  async findByPhone(phone: string): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.getSafeSelect(),
    });
  }

  /** Buscar usuario por ID (sin password) */
  async findById(id: number): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.getSafeSelect(),
    });
  }

  /** Buscar múltiples usuarios con filtros y paginación */
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
      where: this.buildWhereClause({ search, isActive, role }),
      orderBy: { [orderBy]: orderDirection },
      select: this.getSafeSelect(),
    });
  }

  /** Contar usuarios según filtros */
  async count(params: CountUsersParams): Promise<number> {
    return this.prisma.user.count({
      where: this.buildWhereClause(params),
    });
  }

  /** Buscar usuario con password (para auth) */
  async findByPhoneWithPassword(phone: string): Promise<UserWithPasswordFromRepository | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  // ============================================
  // ✏️ MUTACIONES
  // ============================================

  /** Crear usuario */
  async create(userData: UserCreateInput): Promise<UserSafe> {
    return this.prisma.user.create({
      data: userData,
      select: this.getSafeSelect(),
    });
  }

  // ============================================
  // 🔧 MÉTODOS PRIVADOS
  // ============================================

  /** Campos seguros que siempre se retornan sin password */
  private getSafeSelect() {
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

  /** Construye cláusula WHERE según filtros */
  private buildWhereClause(params: { search?: string; isActive?: boolean; role?: Role }) {
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
