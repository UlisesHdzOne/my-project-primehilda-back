import { Injectable, ConflictException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { GiftResolverService } from 'src/modules/gift-resolver/services/gift-resolver.service';
import { AddToCartDto } from '../dtos/requests/add-to-cart.dto';
import { UpdateCartItemDto } from '../dtos/requests/update-cart-item.dto';
import { CartResponseDto } from '../dtos/responses/cart-response.dto';
import { CartEntity } from '../entities/cart.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly giftResolverService: GiftResolverService,
  ) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    // Validar selección de obsequios si existe
    if (addToCartDto.selectedGifts && addToCartDto.selectedGifts.length > 0) {
      const validation = await this.giftResolverService.validateGiftSelection(
        addToCartDto.productId,
        addToCartDto.selectedGifts,
      );

      if (!validation.isValid) {
        throw new ConflictException(validation.message);
      }
    }

    // Agregar al carrito
    const cart = await this.cartRepository.addItemToCart(
      userId,
      addToCartDto,
      addToCartDto.selectedGifts || [],
    );

    return this.toCartResponseDto(cart);
  }

  async getCart(userId: number): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getCartByUserId(userId);

    if (!cart) {
      const newCart = await this.cartRepository.findOrCreateCart(userId);
      return this.toCartResponseDto(newCart);
    }

    return this.toCartResponseDto(cart);
  }

  async updateItemQuantity(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOrCreateCart(userId);

    await this.cartRepository.updateItemQuantity(cart.id, itemId, updateCartItemDto.quantity);

    const updatedCart = await this.cartRepository.getCartByUserId(userId);
    return this.toCartResponseDto(updatedCart!);
  }

  async removeItem(userId: number, itemId: number): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOrCreateCart(userId);

    await this.cartRepository.removeItem(cart.id, itemId);

    const updatedCart = await this.cartRepository.getCartByUserId(userId);
    return this.toCartResponseDto(updatedCart!);
  }

  async clearCart(userId: number): Promise<{ message: string }> {
    await this.cartRepository.clearCart(userId);
    return { message: 'Carrito vaciado exitosamente' };
  }

  private toCartResponseDto(cart: CartEntity): CartResponseDto {
    const cartData = {
      ...cart,
      totalPrice: cart.getTotalPrice(),
      totalItems: cart.getTotalItems(),
      items: cart.items.map(item => ({
        ...item,
        totalPrice: item.getTotalPrice(),
      })),
    };

    return plainToInstance(CartResponseDto, cartData, { excludeExtraneousValues: true });
  }
}
