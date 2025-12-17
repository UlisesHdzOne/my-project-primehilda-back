import { IsNumber, IsString } from 'class-validator';

export class CreateServiceTypeDto {
  @IsString()
  name!: string;
  @IsNumber()
  basePrice!: number;
  @IsNumber()
  duration!: number;
}
