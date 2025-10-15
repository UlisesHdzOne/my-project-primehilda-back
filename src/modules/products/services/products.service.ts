import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductBusinessValidatorCreate } from '../validators-business/product-business-create.validator';
import { ErrorHelper } from 'src/common/helper/error.helper';
import { Prisma } from '@prisma/client';

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
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    // 1. Validación de negocio
    await ProductBusinessValidatorCreate.validar(dto, this.prisma);

    // 2. Creación del producto en Prisma
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        image: dto.image, // ✅ Mapeo de image corregido
        isActive: dto.isActive ?? true,
        freeOptions: dto.freeOptions
          ? {
              create: dto.freeOptions.map((opt) => ({
                category: opt.category,
                quantity: opt.quantity,
                orderType: opt.orderType,
              })),
            }
          : undefined,
      },
      include: FREE_OPTION_INCLUDE,
    });

    // 3. Retorno de la entidad sin error de tipado
    return new ProductEntity(product); // ✅ Se pasa el payload directo para evitar errores de nulos/undefined
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      include: FREE_OPTION_INCLUDE,
      orderBy: { id: 'asc' },
    });

    return products.map((p) => new ProductEntity(p));
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: FREE_OPTION_INCLUDE,
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    return new ProductEntity(product);
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
        image: dto.image,
        isActive: dto.isActive,
        freeOptions: dto.freeOptions
          ? {
              deleteMany: {},
              create: dto.freeOptions.map((opt) => ({
                category: opt.category,
                quantity: opt.quantity,
                orderType: opt.orderType,
              })),
            }
          : undefined,
      },
      include: FREE_OPTION_INCLUDE,
    });

    return new ProductEntity(product);
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        ErrorHelper.notFoundException(`Producto con ID ${id} no encontrado.`);
      }

      throw e;
    }
  }
}
