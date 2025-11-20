import { IsInt, IsArray, Min, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class GiftSelectionDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class AddToCartDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity: number = 1;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GiftSelectionDto)
  @IsOptional()
  selectedGifts: GiftSelectionDto[] = [];
}
