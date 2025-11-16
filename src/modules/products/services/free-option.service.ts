import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FreeOptionService {
  constructor(private readonly prisma: PrismaService) {}

  prepareCreate(
    freeOptions?: Array<{
      category: string;
      quantity: number;
      orderType: string;
    }>,
  ): Prisma.ProductCreateInput['freeOptions'] | undefined {
    if (!freeOptions || freeOptions.length === 0) return undefined;
    return {
      create: freeOptions.map((opt) => ({
        category: opt.category,
        quantity: opt.quantity,
        orderType: opt.orderType,
      })),
    };
  }

  async prepareUpdate(
    productId: number,
    newFreeOptions?: Array<{
      category: string;
      quantity: number;
      orderType: string;
    }>,
  ): Promise<Prisma.ProductUpdateInput['freeOptions']> {
    if (!newFreeOptions) return undefined;

    const existingOptions = await this.prisma.freeOption.findMany({
      where: { productId },
      select: { id: true, category: true, quantity: true, orderType: true },
    });

    const optionsToDelete: number[] = [];
    const optionsToUpdate: Array<{
      where: Prisma.FreeOptionWhereUniqueInput;
      data: Prisma.FreeOptionUpdateManyMutationInput;
    }> = [];
    const optionsToCreate: Prisma.FreeOptionCreateWithoutProductInput[] = [];

    existingOptions.forEach((existing) => {
      const matching = newFreeOptions.find(
        (n) =>
          n.category === existing.category &&
          n.orderType === existing.orderType,
      );
      if (matching) {
        if (matching.quantity !== existing.quantity) {
          optionsToUpdate.push({
            where: { id: existing.id },
            data: { quantity: matching.quantity },
          });
        }
      } else {
        optionsToDelete.push(existing.id);
      }
    });

    newFreeOptions.forEach((n) => {
      const exists = existingOptions.some(
        (e) => e.category === n.category && e.orderType === n.orderType,
      );
      if (!exists) optionsToCreate.push({ ...n });
    });

    if (
      optionsToDelete.length ||
      optionsToUpdate.length ||
      optionsToCreate.length
    ) {
      const updateInput: Prisma.ProductUpdateInput['freeOptions'] = {};
      if (optionsToDelete.length)
        updateInput.deleteMany = { id: { in: optionsToDelete } };
      if (optionsToUpdate.length) updateInput.updateMany = optionsToUpdate;
      if (optionsToCreate.length) updateInput.create = optionsToCreate;
      return updateInput;
    }

    return undefined;
  }
}
