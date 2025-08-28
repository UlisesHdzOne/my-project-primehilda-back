import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from './jwt/jwt.module';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  imports: [HttpModule, JwtModule, GuardsModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [JwtModule, GuardsModule],
})
export class AuthModule {}
