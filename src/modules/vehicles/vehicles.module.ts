import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { DatabaseModule } from '@/core/database/database.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
