import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    DatabaseModule, //SE IMPORTA EL MODULO DE prisma service
    CommonModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
