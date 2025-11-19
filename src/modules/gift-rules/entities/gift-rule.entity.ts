export class GiftRuleEntity {
  id!: number;
  principalProductId!: number;
  allowedGiftIds!: number[];
  maxFreeQuantity!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<GiftRuleEntity>) {
    Object.assign(this, partial);
  }
}
