import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UserValidator } from './services/user.validator';
import { UserQueryService } from './services/UserQueryService';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, UserQueryService, UserValidator, PrismaService],
})
export class UserModule {}
