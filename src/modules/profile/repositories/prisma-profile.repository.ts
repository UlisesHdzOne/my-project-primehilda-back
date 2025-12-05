import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { IProfileRepository } from './profile-repository.interface';
import type {
  UserWithProfileOutput,
  UpdateCompleteProfileInput,
  ProfileFromRepository,
  CreateProfileInput,
} from '../types/profile.types';

@Injectable()
export class PrismaProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserWithProfile(userId: number): Promise<UserWithProfileOutput | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: this.getUserWithProfileSelect(),
    });
  }

  async findProfileByUserId(userId: number): Promise<ProfileFromRepository | null> {
    return this.prisma.userProfile.findUnique({ where: { userId } });
  }

  async profileExists(userId: number): Promise<boolean> {
    const count = await this.prisma.userProfile.count({ where: { userId } });
    return count > 0;
  }

  async updateUserWithProfile(
    userId: number,
    data: UpdateCompleteProfileInput,
  ): Promise<UserWithProfileOutput> {
    return this.prisma.$transaction(async tx => {
      const userExists = await tx.user.findUnique({ where: { id: userId } });
      if (!userExists) throw new NotFoundException('Usuario no encontrado');

      if (data.name !== undefined) {
        await tx.user.update({ where: { id: userId }, data: { name: data.name } });
      }

      if (data.bio !== undefined || data.avatarUrl !== undefined) {
        await tx.userProfile.upsert({
          where: { userId },
          update: {
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
          },
          create: {
            userId,
            bio: data.bio ?? null,
            avatarUrl: data.avatarUrl ?? null,
          },
        });
      }

      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: this.getUserWithProfileSelect(),
      });

      if (!updatedUser) throw new NotFoundException('Usuario no encontrado después de actualizar');
      return updatedUser as UserWithProfileOutput;
    });
  }

  async createProfile(data: CreateProfileInput): Promise<ProfileFromRepository> {
    return this.prisma.userProfile.create({
      data: { userId: data.userId, bio: data.bio ?? null, avatarUrl: data.avatarUrl ?? null },
    });
  }

  private getUserWithProfileSelect() {
    return {
      id: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: { select: { id: true, userId: true, bio: true, avatarUrl: true } },
    } as const;
  }
}
