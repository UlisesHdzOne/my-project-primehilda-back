import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductController } from './controllers/products.controller';
import { ProductService } from './services/products.service';
import { ProductValidator } from './services/product.validator';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductValidator, PrismaService],
})
export class ProductsModule {}
