import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { CartRepository } from './repositories/cart.repository';
import { GiftResolverModule } from '../gift-resolver/gift-resolver.module';
import { ProductsModule } from '../products/products.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, GiftResolverModule, ProductsModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
