// src/modules/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaProfileRepository } from './repositories/prisma-profile.repository';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [UsersModule, DatabaseModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    {
      provide: 'PROFILE_REPOSITORY',
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
