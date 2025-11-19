import { IsString, IsBoolean, IsOptional, IsNumber, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(10)
  address: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  state: string;

  @IsString()
  @MinLength(5)
  zipCode: string;

  @IsString()
  @IsOptional()
  country?: string = 'México';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
