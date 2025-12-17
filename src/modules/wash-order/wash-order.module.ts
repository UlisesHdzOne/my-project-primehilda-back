import { Module } from '@nestjs/common';
import { WashOrderService } from './wash-order.service';
import { WashOrderController } from './wash-order.controller';
import { DatabaseModule } from '@/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WashOrderController],
  providers: [WashOrderService],
})
export class WashOrderModule {}
