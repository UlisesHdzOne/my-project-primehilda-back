import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { DatabaseModule } from '@/core/database/database.module';
import { CarsService } from './cars.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}
