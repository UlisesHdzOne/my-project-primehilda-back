import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductEntity } from '../entities/product.entity';

export interface PaginatedProducts {
  data: ProductEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const FREE_OPTION_INCLUDE = {
  freeOptions: {
    select: {
      id: true,
      category: true,
      quantity: true,
      orderType: true,
    },
  },
};

@Injectable()
export class ProductQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedProducts> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: FREE_OPTION_INCLUDE,
      }),
      this.prisma.product.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map((p) => ProductEntity.fromPrisma(p)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findByCategory(category: string): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: { category, isActive: true },
      include: FREE_OPTION_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return products.map((p) => ProductEntity.fromPrisma(p));
  }

  async findActive(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: FREE_OPTION_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return products.map((p) => ProductEntity.fromPrisma(p));
  }
}
