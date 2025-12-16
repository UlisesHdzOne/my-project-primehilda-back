import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDetailDto } from './create-car-detail.dto';

export class UpdateCarDetailDto extends PartialType(CreateCarDetailDto) {}
