import { IsInt, IsArray, IsBoolean, Min, ArrayMinSize } from 'class-validator';

export class CreateGiftRuleDto {
  @IsInt()
  @Min(1)
  principalProductId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  allowedGiftIds!: number[];

  @IsInt()
  @Min(1)
  maxFreeQuantity!: number;

  @IsBoolean()
  isActive?: boolean = true;
}
