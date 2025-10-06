import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  street: string;

  @IsString()
  colony: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
