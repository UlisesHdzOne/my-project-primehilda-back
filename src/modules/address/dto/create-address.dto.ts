import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { ADDRESS_MESSAGES } from 'src/common/constants';

export class CreateAddressDto {
  @IsOptional()
  @IsString({ message: ADDRESS_MESSAGES.nameInvalido })
  @IsNotEmpty({ message: ADDRESS_MESSAGES.nameRequerido })
  name?: string;

  @IsString({ message: ADDRESS_MESSAGES.streetInvalido })
  @IsNotEmpty({ message: ADDRESS_MESSAGES.streetRequerido })
  street: string;

  @IsString({ message: ADDRESS_MESSAGES.colonyInvalido })
  @IsNotEmpty({ message: ADDRESS_MESSAGES.colonyRequerido })
  colony: string;

  @IsOptional()
  @IsString({ message: ADDRESS_MESSAGES.referenceInvalido })
  reference?: string;

  @IsOptional()
  @IsString({ message: ADDRESS_MESSAGES.zipcodeInvalido })
  zipcode?: string;

  @IsNumber({}, { message: ADDRESS_MESSAGES.latitudeInvalido })
  @Type(() => Number)
  latitude: number;

  @IsNumber({}, { message: ADDRESS_MESSAGES.longitudeInvalido })
  @Type(() => Number)
  longitude: number;

  @IsOptional()
  @IsBoolean({ message: ADDRESS_MESSAGES.isDefaultInvalido })
  @Type(() => Boolean)
  isDefault?: boolean;
}
