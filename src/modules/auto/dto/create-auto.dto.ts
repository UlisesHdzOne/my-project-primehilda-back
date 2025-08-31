import { IsNumber, IsString, Min } from 'class-validator';

export class CreateAutoDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsString()
  color: string;

  @IsNumber()
  anio: number;

  @IsString()
  placas: string;

  @IsNumber()
  @Min(0.01, { message: 'El precio debe ser mayor a 0' })
  precio: number;
}
