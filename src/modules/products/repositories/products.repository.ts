import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductDto } from '../dtos/requests/create-product.dto';
import { UpdateProductDto } from '../dtos/requests/update-product.dto';
import { PaginationParams } from 'src/shared/interfaces/pagination.interface';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const existingProduct = await this.prisma.product.findFirst({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con este nombre');
    }

    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    // SOLUCIÓN: Usar type assertion
    return new ProductEntity(product as Partial<ProductEntity>);
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    return product ? new ProductEntity(product as Partial<ProductEntity>) : null;
  }

  async findAll(
    pagination: PaginationParams & {
      category?: string;
      search?: string;
      isActive?: boolean;
    },
  ): Promise<{ products: ProductEntity[]; total: number }> {
    const { page, limit, category, search, isActive } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map(product => new ProductEntity(product as Partial<ProductEntity>)),
      total,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new ConflictException('Producto no encontrado');
    }

    if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
      const productWithSameName = await this.prisma.product.findFirst({
        where: {
          name: updateProductDto.name,
          id: { not: id },
        },
      });

      if (productWithSameName) {
        throw new ConflictException('Ya existe otro producto con este nombre');
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return new ProductEntity(product as Partial<ProductEntity>);
  }

  async remove(id: number): Promise<void> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new ConflictException('Producto no encontrado');
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async toggleActive(id: number, isActive: boolean): Promise<ProductEntity> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new ConflictException('Producto no encontrado');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive },
    });

    return new ProductEntity(product as Partial<ProductEntity>);
  }

  async findByCategory(category: string): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(product => new ProductEntity(product as Partial<ProductEntity>));
  }

  async searchProducts(search: string): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(product => new ProductEntity(product as Partial<ProductEntity>));
  }
}
