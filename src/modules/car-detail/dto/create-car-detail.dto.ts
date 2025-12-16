import { IsInt, IsString } from 'class-validator';

export class CreateCarDetailDto {
  @IsInt()
  carId!: number;

  @IsString()
  notes?: string;
}
