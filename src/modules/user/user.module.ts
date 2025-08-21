import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controllers';
import { UserService } from './services/user.services';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '../auth/jwt/jwt.module';

@Module({
  imports: [AuthModule,JwtModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
