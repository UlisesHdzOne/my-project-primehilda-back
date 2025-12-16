import { Module } from '@nestjs/common';
import { CarDetailService } from './car-detail.service';
import { CarDetailController } from './car-detail.controller';
import { DatabaseModule } from '@/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CarDetailController],
  providers: [CarDetailService],
})
export class CarDetailModule {}
