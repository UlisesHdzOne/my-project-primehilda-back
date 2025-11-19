import { GiftRulesController } from './controllers/gift-rules.controller';
import { GiftRulesService } from './services/gift-rules.service';
import { GiftRulesRepository } from './repositories/gift-rules.repository';
import { JwtModule } from '@nestjs/jwt';
import { ProductsModule } from '../products/products.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [JwtModule, ProductsModule],
  controllers: [GiftRulesController],
  providers: [GiftRulesService, GiftRulesRepository],
  exports: [GiftRulesService, GiftRulesRepository],
})
export class GiftRulesModule {}
