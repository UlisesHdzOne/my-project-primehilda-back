import { Module } from '@nestjs/common';
import { GiftResolverService } from './services/gift-resolver.service';
import { GiftRulesModule } from '../gift-rules/gift-rules.module';
import { ProductsModule } from '../products/products.module';
import { GiftResolverTestController } from './controllers/gift-resolver-test.controller';

@Module({
  imports: [GiftRulesModule, ProductsModule],
  controllers: [GiftResolverTestController],
  providers: [GiftResolverService],
  exports: [GiftResolverService],
})
export class GiftResolverModule {}
