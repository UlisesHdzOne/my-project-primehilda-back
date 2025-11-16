import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductValidator } from './product.validator';
import { FreeOptionService } from './free-option.service';
import { PRODUCT_MESSAGES } from 'src/common/constants';

const FREE_OPTION_INCLUDE = {
  freeOptions: {
    select: { id: true, category: true, quantity: true, orderType: true },
  },
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productValidator: ProductValidator,
    private readonly freeOptionService: FreeOptionService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    await this.productValidator.validateCreate(dto);
    const freeOptionsData = this.freeOptionService.prepareCreate(
      dto.freeOptions,
    );

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
        freeOptions: freeOptionsData,
      },
      include: FREE_OPTION_INCLUDE,
    });

    return ProductEntity.fromPrisma(product);
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: FREE_OPTION_INCLUDE,
    });

    if (!product)
      throw new NotFoundException(PRODUCT_MESSAGES.productoNoEncontrado);
    return ProductEntity.fromPrisma(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    await this.productValidator.validateUpdate(id, dto);
    const freeOptionsUpdate = await this.freeOptionService.prepareUpdate(
      id,
      dto.freeOptions,
    );

    const product = await this.prisma.product.update({
      where: { id },
      data: { ...dto, freeOptions: freeOptionsUpdate },
      include: FREE_OPTION_INCLUDE,
    });

    return ProductEntity.fromPrisma(product);
  }

  async remove(id: number): Promise<void> {
    await this.productValidator.validateExists(id);
    await this.prisma.product.delete({ where: { id } });
  }
}
