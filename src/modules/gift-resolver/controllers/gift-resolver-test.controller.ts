import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GiftResolverService } from '../services/gift-resolver.service';
import { Public } from 'src/common/guards/jwt-auth.guard';

@Controller('test/gift-resolver')
@Public()
export class GiftResolverTestController {
  constructor(private readonly giftResolverService: GiftResolverService) {}

  @Get('rules/:productId')
  async getGiftRules(@Param('productId', ParseIntPipe) productId: number) {
    return this.giftResolverService.getGiftRules(productId);
  }

  @Get('has-gifts/:productId')
  async hasGifts(@Param('productId', ParseIntPipe) productId: number) {
    return { hasGifts: await this.giftResolverService.hasGifts(productId) };
  }

  @Get('available-gifts/:productId')
  async getAvailableGifts(@Param('productId', ParseIntPipe) productId: number) {
    return this.giftResolverService.getAvailableGifts(productId);
  }

  @Get('validate')
  async validateGiftSelection(
    @Query('principalId', ParseIntPipe) principalId: number,
    @Query('gifts') gifts: string, // formato: "4:1,5:2,6:1" -> productId:quantity
  ) {
    const selectedGifts = gifts.split(',').map(item => {
      const [productId, quantity] = item.split(':');
      return {
        productId: parseInt(productId),
        quantity: parseInt(quantity),
      };
    });

    return this.giftResolverService.validateGiftSelection(principalId, selectedGifts);
  }
}
