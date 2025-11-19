import { PartialType } from '@nestjs/mapped-types';
import { CreateGiftRuleDto } from './create-gift-rule.dto';

export class UpdateGiftRuleDto extends PartialType(CreateGiftRuleDto) {}
