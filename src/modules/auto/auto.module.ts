import { Module } from '@nestjs/common';
import { AutoService } from './services/auto.service';
//import { AutoController } from './controllers/auto.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [],
  providers: [AutoService, PrismaService],
})
export class AutoModule {}
