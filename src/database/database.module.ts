import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
// Módulo NO global. Se importa explícitamente donde se necesite.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
