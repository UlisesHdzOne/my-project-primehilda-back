import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
//import { ProductController } from './controllers/products.controller';
import { ProductService } from './services/products.service';
import { ProductValidator } from './services/product.validator';
import { FreeOptionService } from './services/free-option.service';
import { ProductQueryService } from './services/product-query.service';
import { ProductsController } from './controllers/products.controller';
import { FreeOptionValidator } from './services/FreeOptionValidator';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductService,
    ProductValidator,
    FreeOptionService,
    ProductQueryService,
    FreeOptionValidator,
    PrismaService,
  ],
})
export class ProductsModule {}
