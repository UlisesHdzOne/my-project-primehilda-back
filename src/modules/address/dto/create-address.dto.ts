import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  name: string;

  @IsString()
  street: string;
  
  @IsString()
  colony: string;
  
  @IsString()
  reference: string;
  
  @IsString()
  zipcode: string;
  
  @IsNumber()
  latitude: number;
  
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}
