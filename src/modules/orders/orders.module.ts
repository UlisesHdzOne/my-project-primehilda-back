import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardsModule } from '../../guards/guards.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [GuardsModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
