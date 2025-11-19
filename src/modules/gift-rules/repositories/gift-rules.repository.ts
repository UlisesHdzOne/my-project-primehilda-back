import { PrismaService } from 'src/database/prisma.service';
import { GiftRuleEntity } from '../entities/gift-rule.entity';
import { CreateGiftRuleDto } from '../dtos/requests/create-gift-rule.dto';
import { UpdateGiftRuleDto } from '../dtos/requests/update-gift-rule.dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GiftRulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGiftRuleDto: CreateGiftRuleDto): Promise<GiftRuleEntity> {
    // Verificar que el producto principal exista
    const principalProduct = await this.prisma.product.findUnique({
      where: { id: createGiftRuleDto.principalProductId },
    });

    if (!principalProduct) {
      throw new NotFoundException('Producto principal no encontrado');
    }

    // Verificar que no exista ya una regla para este producto
    const existingRule = await this.prisma.giftRule.findUnique({
      where: { principalProductId: createGiftRuleDto.principalProductId },
    });

    if (existingRule) {
      throw new ConflictException('Ya existe una regla para este producto');
    }

    // Verificar que los productos obsequio existan
    const giftProducts = await this.prisma.product.findMany({
      where: { id: { in: createGiftRuleDto.allowedGiftIds } },
    });

    if (giftProducts.length !== createGiftRuleDto.allowedGiftIds.length) {
      throw new NotFoundException('Algunos productos obsequio no existen');
    }

    const giftRule = await this.prisma.giftRule.create({
      data: createGiftRuleDto,
    });

    return new GiftRuleEntity(giftRule as Partial<GiftRuleEntity>);
  }

  async findById(id: number): Promise<GiftRuleEntity | null> {
    const giftRule = await this.prisma.giftRule.findUnique({
      where: { id },
      include: { principalProduct: true },
    });

    return giftRule ? new GiftRuleEntity(giftRule as Partial<GiftRuleEntity>) : null;
  }

  async findByProductId(productId: number): Promise<GiftRuleEntity | null> {
    const giftRule = await this.prisma.giftRule.findUnique({
      where: { principalProductId: productId },
      include: { principalProduct: true },
    });

    return giftRule ? new GiftRuleEntity(giftRule as Partial<GiftRuleEntity>) : null;
  }

  async findAll(): Promise<GiftRuleEntity[]> {
    const giftRules = await this.prisma.giftRule.findMany({
      include: { principalProduct: true },
      orderBy: { createdAt: 'desc' },
    });

    return giftRules.map(rule => new GiftRuleEntity(rule as Partial<GiftRuleEntity>));
  }

  async update(id: number, updateGiftRuleDto: UpdateGiftRuleDto): Promise<GiftRuleEntity> {
    const existingRule = await this.findById(id);
    if (!existingRule) {
      throw new NotFoundException('Regla de obsequio no encontrada');
    }

    // SOLUCIÓN: Type assertion para acceder a allowedGiftIds
    const dto = updateGiftRuleDto as any;
    if (dto.allowedGiftIds && dto.allowedGiftIds.length > 0) {
      const giftProducts = await this.prisma.product.findMany({
        where: { id: { in: dto.allowedGiftIds } },
      });

      if (giftProducts.length !== dto.allowedGiftIds.length) {
        throw new NotFoundException('Algunos productos obsequio no existen');
      }
    }

    const giftRule = await this.prisma.giftRule.update({
      where: { id },
      data: updateGiftRuleDto,
      include: { principalProduct: true },
    });

    return new GiftRuleEntity(giftRule as Partial<GiftRuleEntity>);
  }
  async remove(id: number): Promise<void> {
    const existingRule = await this.findById(id);
    if (!existingRule) {
      throw new NotFoundException('Regla de obsequio no encontrada');
    }

    await this.prisma.giftRule.delete({
      where: { id },
    });
  }

  async toggleActive(id: number, isActive: boolean): Promise<GiftRuleEntity> {
    const existingRule = await this.findById(id);
    if (!existingRule) {
      throw new NotFoundException('Regla de obsequio no encontrada');
    }

    const giftRule = await this.prisma.giftRule.update({
      where: { id },
      data: { isActive },
      include: { principalProduct: true },
    });

    return new GiftRuleEntity(giftRule as Partial<GiftRuleEntity>);
  }
}
