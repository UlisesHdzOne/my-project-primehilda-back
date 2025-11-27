import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateUserData, IUserRepository } from './user-repository.interface';
import { User } from '@prisma/client';

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
}
