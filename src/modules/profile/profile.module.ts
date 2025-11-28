// src/modules/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaProfileRepository } from './repositories/prisma-profile.repository';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [UsersModule],
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
