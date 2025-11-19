import { GiftRulesService } from '../services/gift-rules.service';
import { CreateGiftRuleDto } from '../dtos/requests/create-gift-rule.dto';
import { UpdateGiftRuleDto } from '../dtos/requests/update-gift-rule.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/shared/constants';
import { Controller, UseGuards } from '@nestjs/common';
import { Post, Get, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';

@Controller('gift-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class GiftRulesController {
  constructor(private readonly giftRulesService: GiftRulesService) {}

  @Post()
  async createGiftRule(@Body() createGiftRuleDto: CreateGiftRuleDto) {
    return this.giftRulesService.create(createGiftRuleDto);
  }

  @Get()
  async getGiftRules() {
    return this.giftRulesService.findAll();
  }

  @Get(':id')
  async getGiftRule(@Param('id', ParseIntPipe) id: number) {
    return this.giftRulesService.findById(id);
  }

  @Get('product/:productId')
  async getGiftRuleByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.giftRulesService.findByProductId(productId);
  }

  @Put(':id')
  async updateGiftRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGiftRuleDto: UpdateGiftRuleDto,
  ) {
    return this.giftRulesService.update(id, updateGiftRuleDto);
  }

  @Delete(':id')
  async deleteGiftRule(@Param('id', ParseIntPipe) id: number) {
    return this.giftRulesService.remove(id);
  }

  @Put(':id/status')
  async toggleGiftRuleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.giftRulesService.toggleActive(id, isActive);
  }
}
