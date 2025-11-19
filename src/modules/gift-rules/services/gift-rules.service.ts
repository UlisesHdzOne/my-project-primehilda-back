import { GiftRulesRepository } from '../repositories/gift-rules.repository';
import { CreateGiftRuleDto } from '../dtos/requests/create-gift-rule.dto';
import { UpdateGiftRuleDto } from '../dtos/requests/update-gift-rule.dto';
import { GiftRuleResponseDto } from '../dtos/responses/gift-rule-response.dto';
import { plainToInstance } from 'class-transformer';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GiftRulesService {
  constructor(private readonly giftRulesRepository: GiftRulesRepository) {}

  async create(createGiftRuleDto: CreateGiftRuleDto): Promise<GiftRuleResponseDto> {
    const giftRule = await this.giftRulesRepository.create(createGiftRuleDto);
    return plainToInstance(GiftRuleResponseDto, giftRule, { excludeExtraneousValues: true });
  }

  async findById(id: number): Promise<GiftRuleResponseDto> {
    const giftRule = await this.giftRulesRepository.findById(id);
    if (!giftRule) {
      throw new NotFoundException('Regla de obsequio no encontrada');
    }
    return plainToInstance(GiftRuleResponseDto, giftRule, { excludeExtraneousValues: true });
  }

  async findByProductId(productId: number): Promise<GiftRuleResponseDto | null> {
    const giftRule = await this.giftRulesRepository.findByProductId(productId);
    return giftRule
      ? plainToInstance(GiftRuleResponseDto, giftRule, { excludeExtraneousValues: true })
      : null;
  }

  async findAll(): Promise<GiftRuleResponseDto[]> {
    const giftRules = await this.giftRulesRepository.findAll();
    return plainToInstance(GiftRuleResponseDto, giftRules, { excludeExtraneousValues: true });
  }

  async update(id: number, updateGiftRuleDto: UpdateGiftRuleDto): Promise<GiftRuleResponseDto> {
    const giftRule = await this.giftRulesRepository.update(id, updateGiftRuleDto);
    return plainToInstance(GiftRuleResponseDto, giftRule, { excludeExtraneousValues: true });
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.giftRulesRepository.remove(id);
    return { message: 'Regla de obsequio eliminada exitosamente' };
  }

  async toggleActive(id: number, isActive: boolean): Promise<GiftRuleResponseDto> {
    const giftRule = await this.giftRulesRepository.toggleActive(id, isActive);
    return plainToInstance(GiftRuleResponseDto, giftRule, { excludeExtraneousValues: true });
  }
}
