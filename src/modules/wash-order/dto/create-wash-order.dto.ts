import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWashOrderServiceDto } from './create-wash-order-service.dto';

export class CreateWashOrderDto {
  @IsNumber()
  carId!: number;

  @IsNumber()
  employeeId!: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateWashOrderServiceDto)
  services?: CreateWashOrderServiceDto[];
}
