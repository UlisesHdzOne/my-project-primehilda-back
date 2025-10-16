import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderItemDto } from '../dto/order-item.dto';
import { OrderType } from '../../../common/constants/order-type.enum';
import {
  CalculationResult,
  CalculatedItem,
  GiftItem,
} from '../entities/order-calculation.interface'; // Usamos las interfaces definidas

@Injectable()
export class OrderCalculatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula ítems pagados, subtotal y regalos (manejo de límites y excesos).
   */
  async calculateItemsAndGifts(
    items: OrderItemDto[],
    orderType: OrderType,
  ): Promise<CalculationResult> {
    let subtotal = 0;

    // 1. Recopilar IDs de productos
    const productIds = items.map((item) => item.productId);
    const giftProductIds = items
      .flatMap((item) => item.chosenGifts || [])
      .map((gift) => gift.productId);

    const allProductIds = [...new Set([...productIds, ...giftProductIds])];

    // 2. Obtener todos los productos, precios y reglas (freeOptions) de la DB
    const allProducts = await this.prisma.product.findMany({
      where: { id: { in: allProductIds } },
      include: {
        freeOptions: {
          select: { category: true, quantity: true, orderType: true },
        },
      },
    });

    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const calculatedItems: CalculatedItem[] = [];

    type PrismaFreeOption = {
      category: string;
      quantity: number;
      orderType: string;
    };

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue; // Ya validado por OrderValidator

      // A) Preparación para el Item Principal Pagado (Precio)
      const itemPrice = product.price * item.quantity;

      // B) Determinación del Límite de Regalos
      const limits = new Map<
        string,
        { allowedQuantity: number; category: string }
      >();
      const safeFreeOptions = product.freeOptions as PrismaFreeOption[];

      safeFreeOptions
        .filter((opt) => opt.orderType === (orderType as string))
        .forEach((opt) => {
          const allowedQuantity = opt.quantity * item.quantity;
          limits.set(opt.category, { allowedQuantity, category: opt.category });
        });

      const finalGifts: GiftItem[] = [];

      // C) Procesamiento de los Regalos Elegidos por el Cliente
      if (item.chosenGifts && item.chosenGifts.length > 0) {
        for (const chosenGift of item.chosenGifts) {
          const giftProduct = productMap.get(chosenGift.productId);

          if (!giftProduct) {
            // Este error ya debería ser atrapado por OrderValidator.validateCreate
            throw new BadRequestException(
              `El producto de regalo elegido (ID: ${chosenGift.productId}) no existe.`,
            );
          }

          const limit = limits.get(giftProduct.category);
          let freeQty = 0;
          let paidQty = 0;

          // Lógica Central: Separar GRATIS (consume límite) vs COBRADO (exceso)
          if (limit) {
            const remainingLimit = limit.allowedQuantity;

            if (chosenGift.quantity <= remainingLimit) {
              freeQty = chosenGift.quantity;
              limit.allowedQuantity -= freeQty;
            } else {
              freeQty = remainingLimit;
              paidQty = chosenGift.quantity - remainingLimit;
              limit.allowedQuantity = 0;
            }
          } else {
            paidQty = chosenGift.quantity;
          }

          // D) Guardar el Regalo (GRATIS)
          if (freeQty > 0) {
            finalGifts.push({
              productId: chosenGift.productId,
              category: giftProduct.category,
              quantity: freeQty,
              unitPrice: 0,
            });
          }

          // E) Guardar el Exceso (COBRADO)
          if (paidQty > 0) {
            const paidPrice = giftProduct.price * paidQty;
            subtotal += paidPrice;

            calculatedItems.push({
              productId: chosenGift.productId,
              quantity: paidQty,
              unitPrice: giftProduct.price,
              subtotal: paidPrice,
              gifts: [],
            });
          }
        }
      }

      // 1. Sumar el costo del item principal
      subtotal += itemPrice;

      // F) Agregar el item principal pagado (que no fue un regalo)
      calculatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemPrice,
        gifts: finalGifts,
      });
    }

    return { calculatedItems, subtotal };
  }
}
