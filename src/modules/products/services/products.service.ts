import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { Prisma } from '@prisma/client';
import { ProductValidator } from './product.validator';
import { PRODUCT_MESSAGES } from 'src/common/constants';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly productValidator: ProductValidator,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    await this.productValidator.validateCreate(dto);

    const freeOptionsData = dto.freeOptions
      ? {
          create: dto.freeOptions.map((opt) => ({
            category: opt.category,
            quantity: opt.quantity,
            orderType: opt.orderType,
          })),
        }
      : undefined;

    // 2. Creación: Usamos el spread operator para la mayoría de los campos
    const product = await this.prisma.product.create({
      data: {
        ...dto, // ✅ Copia name, description, price, category, image, isActive
        isActive: dto.isActive ?? true, // Sobrescribe si no se envió, manteniendo la lógica de valor por defecto

        // Sobrescribe o añade el campo relacional transformado
        freeOptions: freeOptionsData,
      },
      include: FREE_OPTION_INCLUDE,
    });

    return new ProductEntity(product);
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

    if (!product) {
      throw new NotFoundException(PRODUCT_MESSAGES.productoNoEncontrado);
    }

    return new ProductEntity(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    // 1. Validar reglas de negocio y existencia
    await this.productValidator.validateUpdate(id, dto);

    // 2. Preparar FreeOptions: Eliminar y recrear si el array fue enviado
    const freeOptionsUpdate: Prisma.ProductUpdateInput['freeOptions'] =
      dto.freeOptions
        ? {
            deleteMany: {}, // Borra todas las opciones existentes
            create: dto.freeOptions.map((opt) => ({
              category: opt.category,
              quantity: opt.quantity,
              orderType: opt.orderType,
            })),
          }
        : undefined;

    // 3. Actualización: Usamos el spread operator para los campos simples
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto, // ✅ Copia todos los campos simples (name, price, category, etc.)
        freeOptions: freeOptionsUpdate, // Sobrescribe o añade el campo relacional transformado
      },
      include: FREE_OPTION_INCLUDE,
    });

    return new ProductEntity(product);
  }

  async remove(id: number): Promise<void> {
    await this.productValidator.validateExists(id);
    await this.prisma.product.delete({ where: { id } });
  }
}
