import { Injectable, NotFoundException } from '@nestjs/common';
import { GiftRulesService } from 'src/modules/gift-rules/services/gift-rules.service';
import { ProductsService } from 'src/modules/products/services/products.service';
import {
  GiftSelection,
  GiftValidationResult,
  GiftRuleContext,
} from '../interfaces/gift-selection.interface';
import { ProductPublicDto } from 'src/modules/products/dtos/responses/product-public.dto';

@Injectable()
export class GiftResolverService {
  constructor(
    private readonly giftRulesService: GiftRulesService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Obtener reglas de obsequio para un producto principal
   */
  async getGiftRules(productId: number): Promise<GiftRuleContext | null> {
    try {
      const giftRule = await this.giftRulesService.findByProductId(productId);

      if (!giftRule || !giftRule.isActive) {
        return null;
      }

      return {
        principalProductId: giftRule.principalProductId,
        allowedGiftIds: giftRule.allowedGiftIds,
        maxFreeQuantity: giftRule.maxFreeQuantity,
        isActive: giftRule.isActive,
      };
    } catch (error) {
      // Si no encuentra regla, retorna null (producto sin obsequios)
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Verificar si un producto tiene reglas de obsequio activas
   */
  async hasGifts(productId: number): Promise<boolean> {
    const giftRules = await this.getGiftRules(productId);
    return giftRules !== null;
  }

  /**
   * Obtener productos permitidos como obsequios para un producto principal
   */
  async getAvailableGifts(productId: number): Promise<ProductPublicDto[]> {
    const giftRules = await this.getGiftRules(productId);

    if (!giftRules) {
      return [];
    }

    // SOLUCIÓN: Especificar el tipo del array
    const availableGifts: ProductPublicDto[] = [];

    for (const giftProductId of giftRules.allowedGiftIds) {
      try {
        const product = await this.productsService.findPublicById(giftProductId);
        availableGifts.push(product);
      } catch {
        // Si el producto no existe, lo omitimos
        console.warn(`Producto obsequio no encontrado: ${giftProductId}`);
      }
    }

    return availableGifts;
  }

  /**
   * Validar una selección de obsequios
   */
  async validateGiftSelection(
    principalProductId: number,
    selectedGifts: GiftSelection[],
  ): Promise<GiftValidationResult> {
    const giftRules = await this.getGiftRules(principalProductId);

    if (!giftRules) {
      return {
        isValid: false,
        message: 'Este producto no tiene obsequios disponibles',
      };
    }

    // 1. Verificar que no se exceda la cantidad máxima
    const totalSelected = selectedGifts.reduce((sum, item) => sum + item.quantity, 0);

    if (totalSelected > giftRules.maxFreeQuantity) {
      return {
        isValid: false,
        message: `Excedes la cantidad máxima de obsequios. Máximo: ${giftRules.maxFreeQuantity}`,
        maxFreeQuantity: giftRules.maxFreeQuantity,
        availableQuantity: giftRules.maxFreeQuantity,
      };
    }

    // 2. Verificar que todos los productos seleccionados estén permitidos
    for (const selectedGift of selectedGifts) {
      if (!giftRules.allowedGiftIds.includes(selectedGift.productId)) {
        return {
          isValid: false,
          message: `El producto ID ${selectedGift.productId} no está permitido como obsequio`,
        };
      }
    }

    // 3. Verificar que los productos obsequio existan y estén activos
    for (const selectedGift of selectedGifts) {
      try {
        await this.productsService.findPublicById(selectedGift.productId);
      } catch {
        return {
          isValid: false,
          message: `El producto obsequio ID ${selectedGift.productId} no existe o no está disponible`,
        };
      }
    }

    return {
      isValid: true,
      availableQuantity: giftRules.maxFreeQuantity - totalSelected,
      maxFreeQuantity: giftRules.maxFreeQuantity,
    };
  }

  /**
   * Calcular obsequios restantes disponibles
   */
  async calculateRemainingGifts(
    principalProductId: number,
    usedGifts: GiftSelection[],
  ): Promise<number> {
    const giftRules = await this.getGiftRules(principalProductId);

    if (!giftRules) {
      return 0;
    }

    const totalUsed = usedGifts.reduce((sum, item) => sum + item.quantity, 0);
    return Math.max(0, giftRules.maxFreeQuantity - totalUsed);
  }

  /**
   * Validar múltiples productos principales con sus obsequios
   * Útil para el carrito con varios productos
   */
  async validateCartGifts(
    cartItems: Array<{
      principalProductId: number;
      selectedGifts: GiftSelection[];
    }>,
  ): Promise<GiftValidationResult> {
    for (const item of cartItems) {
      const validation = await this.validateGiftSelection(
        item.principalProductId,
        item.selectedGifts,
      );

      if (!validation.isValid) {
        return validation;
      }
    }

    return { isValid: true };
  }
}
