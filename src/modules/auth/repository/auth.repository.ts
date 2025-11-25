import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear usuario en la base de datos
   */
  async create(data: CreateUserDto): Promise<User & { password: string }> {
    // Tipamos explícitamente el retorno para que password sea string
    return this.prisma.user.create({ data }) as Promise<User & { password: string }>;
  }

  /**
   * Buscar usuario por número de teléfono
   */
  async findOneByPhone(phone: string): Promise<(User & { password: string }) | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    }) as Promise<(User & { password: string }) | null>;
  }
}
