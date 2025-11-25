import { IsNotEmpty, IsInt, IsString, IsDateString } from 'class-validator';

export class CreateReservaDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsNotEmpty()
  horaFin: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsInt()
  userId: number;

  @IsInt()
  salaId: number;
}
