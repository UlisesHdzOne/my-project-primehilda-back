import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controllers';
import { UserService } from './services/user.services';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
