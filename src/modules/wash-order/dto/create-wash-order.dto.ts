import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWashOrderServiceDto } from './create-wash-order-service.dto';
import { OrderStatus } from '@/common/enums';

export class CreateWashOrderDto {
  @IsNumber()
  carId!: number;

  @IsNumber()
  employeeId!: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.PENDING;

  @IsArray()
  @ArrayMinSize(1, { message: 'La orden debe tener al menos un servicio' })
  @ValidateNested({ each: true })
  @Type(() => CreateWashOrderServiceDto)
  services!: CreateWashOrderServiceDto[];
}
