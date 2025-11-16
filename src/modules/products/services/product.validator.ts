import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PRODUCT_MESSAGES } from 'src/common/constants';
import { FreeOptionValidator } from './FreeOptionValidator';
//import { FreeOptionValidator } from './free-option.validator';

@Injectable()
export class ProductValidator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly freeOptionValidator: FreeOptionValidator,
  ) {}

  async validateExists(id: number): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(PRODUCT_MESSAGES.productoNoEncontrado);
    }
  }

  async validateCreate(dto: CreateProductDto): Promise<void> {
    const errors: string[] = [];

    // Nombre único
    if (!(await this.isNameUnique(dto.name))) {
      errors.push(PRODUCT_MESSAGES.nombreDuplicado);
    }

    // Validación freeOptions
    if (dto.freeOptions && dto.freeOptions.length > 0) {
      this.freeOptionValidator.validate(dto.freeOptions);
    }

    if (errors.length) throw new BadRequestException(errors);
  }

  async validateUpdate(id: number, dto: UpdateProductDto): Promise<void> {
    await this.validateExists(id);
    const errors: string[] = [];

    // Nombre único excepto actual
    if (dto.name && !(await this.isNameUnique(dto.name, id))) {
      errors.push(PRODUCT_MESSAGES.nombreDuplicado);
    }

    // Validación freeOptions
    if (dto.freeOptions) {
      this.freeOptionValidator.validate(dto.freeOptions);
    }

    if (errors.length) throw new BadRequestException(errors);
  }

  private async isNameUnique(
    name: string,
    productId?: number,
  ): Promise<boolean> {
    const existing = await this.prisma.product.findFirst({
      where: productId ? { name, NOT: { id: productId } } : { name },
    });
    return !existing;
  }
}
