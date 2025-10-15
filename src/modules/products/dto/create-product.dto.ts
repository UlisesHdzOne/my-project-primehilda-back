import { FreeOptionDto } from './free-option.dto';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateNested,
  ArrayMaxSize,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from 'src/common/constants/product-types.enum';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @IsPositive({ message: 'El precio debe ser un número positivo.' })
  price: number;

  @IsEnum(ProductType, {
    message: `La categoría debe ser uno de los valores válidos: ${Object.values(
      ProductType,
    ).join(', ')}`,
  })
  category: ProductType;

  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto.' })
  image?: string;
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano.' })
  isActive?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FreeOptionDto)
  @ArrayMaxSize(10, {
    message: 'Se permiten un máximo de 10 opciones de regalo por producto.',
  })
  freeOptions?: FreeOptionDto[];
}
