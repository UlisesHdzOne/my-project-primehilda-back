import { IsNumber } from 'class-validator';

export class CreateWashOrderServiceDto {
  @IsNumber()
  serviceTypeId!: number;
}
