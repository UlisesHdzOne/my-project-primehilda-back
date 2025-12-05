import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaProfileRepository } from './repositories/prisma-profile.repository';
import { PrismaService } from '@/database/prisma.service';

@Module({
  controllers: [ProfileController],
  providers: [
    ProfileService,
    PrismaService,
    { provide: 'PROFILE_REPOSITORY', useClass: PrismaProfileRepository },
  ],
})
export class ProfileModule {}
