import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre debe tener menos de 50 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras, números y espacios',
  })
  name!: string;
}
