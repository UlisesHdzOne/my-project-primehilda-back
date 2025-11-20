import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { AddToCartDto } from '../dtos/requests/add-to-cart.dto';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCart(userId: number): Promise<CartEntity> {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return new CartEntity({
      ...cart,
      items: cart.items.map(item => new CartItemEntity(item as Partial<CartItemEntity>)),
    } as Partial<CartEntity>);
  }

  async addItemToCart(
    userId: number,
    addToCartDto: AddToCartDto,
    giftItems: Array<{ productId: number; quantity: number }> = [],
  ): Promise<CartEntity> {
    const cart = await this.findOrCreateCart(userId);

    // Agregar producto principal
    await this.upsertCartItem(cart.id, addToCartDto.productId, addToCartDto.quantity, false);

    // Agregar obsequios
    for (const gift of giftItems) {
      await this.upsertCartItem(
        cart.id,
        gift.productId,
        gift.quantity,
        true,
        addToCartDto.productId,
      );
    }

    return this.findOrCreateCart(userId);
  }

  private async upsertCartItem(
    cartId: number,
    productId: number,
    quantity: number,
    isGift: boolean,
    giftFromProductId?: number,
  ): Promise<void> {
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        isGift,
        giftFromProductId: isGift ? giftFromProductId : null,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId,
          productId,
          quantity,
          isGift,
          giftFromProductId: isGift ? giftFromProductId : null,
        },
      });
    }
  }

  async updateItemQuantity(cartId: number, itemId: number, quantity: number): Promise<void> {
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!existingItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
  }

  async removeItem(cartId: number, itemId: number): Promise<void> {
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!existingItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }

  async getCartByUserId(userId: number): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      return null;
    }

    return new CartEntity({
      ...cart,
      items: cart.items.map(item => new CartItemEntity(item as Partial<CartItemEntity>)),
    } as Partial<CartEntity>);
  }
}
