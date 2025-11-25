import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthRepository } from './repository/auth.repository';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, AuthRepository, PrismaService],
  controllers: [AuthController],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
