import { IsString, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsString()
  color!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
