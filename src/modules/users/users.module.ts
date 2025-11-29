import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'USER_REPOSITORY',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UsersService, 'USER_REPOSITORY'],
})
export class UsersModule {}
