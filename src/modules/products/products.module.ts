import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsAdminController } from './controllers/products.admin.controller';
import { ProductsService } from './services/products.service';
import { ProductsRepository } from './repositories/products.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
