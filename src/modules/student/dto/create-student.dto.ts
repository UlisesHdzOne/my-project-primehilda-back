import { IsString, MinLength, Min, Max, IsNotEmpty, IsInt, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(5, { message: 'La edad mínima es 5 años' })
  @Max(100, { message: 'La edad máxima es 100 años' })
  age: number;
}
