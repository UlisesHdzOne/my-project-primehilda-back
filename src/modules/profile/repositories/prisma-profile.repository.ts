import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { IProfileRepository } from './profile-repository.interface';
import { NotFoundException } from '@nestjs/common';
import {
  UpdatedUserWithProfile,
  UpdateProfileData,
  UserWithProfileFromRepo,
} from '../types/profile-safe.type';

@Injectable()
export class PrismaProfileRepository implements IProfileRepository {
  constructor(private prisma: PrismaService) {}

  async findUserWithProfile(userId: number): Promise<UserWithProfileFromRepo | null> {
    const userWithProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!userWithProfile) {
      return null;
    }

    // TypeScript ya infiere el tipo correctamente
    return userWithProfile;
  }

  async updateUserWithProfile(
    userId: number,
    data: UpdateProfileData,
  ): Promise<UpdatedUserWithProfile> {
    const updatedUser = await this.prisma.$transaction(async tx => {
      // 1. Verificar que el usuario existe
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // 2. Actualizar User (si viene name)
      if (data.name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name: data.name },
        });
      }

      // 3. Upsert UserProfile (si viene bio o avatarUrl)
      if (data.bio !== undefined || data.avatarUrl !== undefined) {
        await tx.userProfile.upsert({
          where: { userId },
          update: {
            bio: data.bio,
            avatarUrl: data.avatarUrl,
          },
          create: {
            userId,
            bio: data.bio ?? null,
            avatarUrl: data.avatarUrl ?? null,
          },
        });
      }

      // 4. Obtener datos actualizados
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              bio: true,
              avatarUrl: true,
            },
          },
        },
      });
    });

    // Aquí TypeScript ya sabe que updatedUser tiene el tipo correcto
    return updatedUser!;
  }
}
