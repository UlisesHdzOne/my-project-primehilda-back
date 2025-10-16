/**
 * Representa un producto de regalo específico.
 */
export interface GiftItem {
  productId: number;
  category: string;
  quantity: number;
  unitPrice: number; // 0 para regalos gratuitos
}

/**
 * Representa un ítem de la orden después de aplicar la lógica de precio y regalos.
 */
export interface CalculatedItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  gifts: GiftItem[]; // Lista de regalos GRATIS asociados a este ítem principal
}

/**
 * Tipo de retorno de la función calculateItemsAndGifts.
 */
export interface CalculationResult {
  calculatedItems: CalculatedItem[];
  subtotal: number;
}
