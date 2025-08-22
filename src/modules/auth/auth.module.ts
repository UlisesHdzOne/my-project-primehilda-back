import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { HttpModule } from '@nestjs/axios';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { JwtModule } from './jwt/jwt.module';


@Module({
  imports:[HttpModule,JwtModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService,JwtAuthGuard,RolesGuard],
  exports: [JwtAuthGuard, RolesGuard,JwtModule],
})
export class AuthModule {}
