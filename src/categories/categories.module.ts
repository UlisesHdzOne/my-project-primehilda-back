import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule], //SE IMPORTA EL MODULO DE prisma service
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
