import { Module } from '@nestjs/common';
import { SalasRepository as SalasRepository } from './repository/salas.repository';
import { PrismaService } from '@/database/prisma.service';
import { SalasService } from './service/salas.service';
import { SalasController } from './controller/salas.controller';

@Module({
  controllers: [SalasController],
  providers: [SalasService, SalasRepository, PrismaService],
})
export class SalasModule {}
