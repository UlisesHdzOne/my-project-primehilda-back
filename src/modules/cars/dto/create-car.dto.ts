import { IsString } from 'class-validator';

export class CreateCarDto {
  @IsString()
  plate!: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsString()
  color!: string;
}
