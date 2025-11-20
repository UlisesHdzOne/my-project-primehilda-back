import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dtos/requests/add-to-cart.dto';
import { UpdateCartItemDto } from '../dtos/requests/update-cart-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  async addToCart(@UserId() userId: number, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  async getCart(@UserId() userId: number) {
    return this.cartService.getCart(userId);
  }

  @Put('items/:id')
  async updateCartItem(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, itemId, updateCartItemDto);
  }

  @Delete('items/:id')
  async removeCartItem(@UserId() userId: number, @Param('id', ParseIntPipe) itemId: number) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Post('clear')
  async clearCart(@UserId() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
