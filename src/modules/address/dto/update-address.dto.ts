import { CreateAddressDto } from './create-address.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateAddressDto  extends PartialType(CreateAddressDto) {}
