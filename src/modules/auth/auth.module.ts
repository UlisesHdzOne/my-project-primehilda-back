import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from './jwt/jwt.module';
import { HttpModule } from '@nestjs/axios';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './jwt/jwt.guard';

@Module({
  imports:[HttpModule,JwtModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService,JwtAuthGuard,RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
