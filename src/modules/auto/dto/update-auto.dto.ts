import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAutoDto } from './create-auto.dto';

export class UpdateAutoDto extends PartialType(
  OmitType(CreateAutoDto, ['marca', 'modelo', 'anio', 'placas'] as const),
) {}

//color precio