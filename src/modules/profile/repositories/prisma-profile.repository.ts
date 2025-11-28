import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { IProfileRepository } from './profile-repository.interface';
import { UserProfile } from '@prisma/client';

@Injectable()
export class PrismaProfileRepository implements IProfileRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async upsert(userId: number, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
