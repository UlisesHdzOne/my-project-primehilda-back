import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateOrderNumber } from '../../../utils/order-number.generator';

@Injectable()
export class OrderNumberGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  private async getLastOrderOfToday(): Promise<{ orderNumber: string } | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.prisma.order.findFirst({
      where: { createdAt: { gte: today, lt: tomorrow } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
  }

  /**
   * Genera el número de orden basado en el último número del día.
   */
  async generate(): Promise<string> {
    const lastOrder = await this.getLastOrderOfToday();
    return generateOrderNumber(lastOrder?.orderNumber);
  }
}
