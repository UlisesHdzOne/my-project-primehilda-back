import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '../core/database/database.module';
import { CommonModule } from '../common/common.module';
import { CategoryBusinessValidator } from './validators/category-business.validator';

@Module({
  imports: [
    DatabaseModule, //SE IMPORTA EL MODULO DE prisma service
    CommonModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryBusinessValidator],
  exports: [CategoriesService], // Exportar si otros módulos lo necesitan
})
export class CategoriesModule {}
