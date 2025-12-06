import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaProfileRepository } from './repositories/prisma-profile.repository';
import { DatabaseModule } from '@/database/database.module'; // ← AÑADIR ESTO

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [ProfileService, { provide: 'PROFILE_REPOSITORY', useClass: PrismaProfileRepository }],
})
export class ProfileModule {}
