import { FreeOptionDto } from './free-option.dto';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateNested,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from 'src/common/constants/product-types.enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsEnum(ProductType)
  category: ProductType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FreeOptionDto)
  @ArrayMaxSize(10)
  freeOptions?: FreeOptionDto[];
}
