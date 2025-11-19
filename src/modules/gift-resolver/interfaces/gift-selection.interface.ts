export interface GiftSelection {
  productId: number;
  quantity: number;
}

export interface GiftValidationResult {
  isValid: boolean;
  message?: string;
  availableQuantity?: number;
  maxFreeQuantity?: number;
}

export interface GiftRuleContext {
  principalProductId: number;
  allowedGiftIds: number[];
  maxFreeQuantity: number;
  isActive: boolean;
}
