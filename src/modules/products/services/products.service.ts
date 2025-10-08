import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductBusinessValidatorCreate } from '../validators-business/product-business-create.validator';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    await ProductBusinessValidatorCreate.validar(dto, this.prisma);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        isActive: dto.isActive ?? true,
        freeOptions: dto.freeOptions
          ? {
              create: dto.freeOptions.map((opt) => ({
                category: opt.category,
                quantity: opt.quantity,
              })),
            }
          : undefined,
      },
      include: { freeOptions: true },
    });

    return new ProductEntity({
      ...product,
      description: product.description ?? undefined,
    });
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      include: { freeOptions: true },
      orderBy: { id: 'asc' },
    });

    return products.map(
      (p) =>
        new ProductEntity({
          ...p,
          description: p.description ?? undefined,
        }),
    );
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { freeOptions: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    return new ProductEntity({
      ...product,
      description: product.description ?? undefined,
    });
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Producto no encontrado');

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        isActive: dto.isActive,
        freeOptions: dto.freeOptions
          ? {
              deleteMany: {}, // Limpia opciones anteriores
              create: dto.freeOptions.map((opt) => ({
                category: opt.category,
                quantity: opt.quantity,
              })),
            }
          : undefined,
      },
      include: { freeOptions: true },
    });

    return new ProductEntity({
      ...product,
      description: product.description ?? undefined,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.freeOption.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });
  }
}
