import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { IProfileRepository } from './profile-repository.interface';
import { UserWithProfileResponseDto } from '../dto/user-with-profile-response.dto';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { UpdateCompleteProfileDto } from '../dto/update-complete-profile.dto';

@Injectable()
export class PrismaProfileRepository implements IProfileRepository {
  constructor(private prisma: PrismaService) {}

  async findUserWithProfile(userId: number): Promise<UserWithProfileResponseDto | null> {
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

    return plainToInstance(UserWithProfileResponseDto, userWithProfile);
  }

  // ✅ ACTUALIZAR PERFIL COMPLETO
  async updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileDto,
  ): Promise<UserWithProfileResponseDto> {
    const updatedUser = await this.prisma.$transaction(async tx => {
      // 1. Verificar que el usuario existe
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // 2. Actualizar User (si viene name)
      if (data.name) {
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
            bio: data.bio,
            avatarUrl: data.avatarUrl,
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
          password: true,
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

    return plainToInstance(UserWithProfileResponseDto, updatedUser);
  }
}
