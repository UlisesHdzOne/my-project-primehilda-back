import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardsModule } from '../../guards/guards.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersValidator } from './services/order.validator';
import { OrderCalculatorService } from './services/order-calculator.service';
import { OrderNumberGeneratorService } from './services/order-number-generator.service';

@Module({
  imports: [GuardsModule, AuthModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    OrdersValidator,
    OrderCalculatorService,
    OrderNumberGeneratorService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
