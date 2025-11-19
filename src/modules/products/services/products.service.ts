import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { CreateProductDto } from '../dtos/requests/create-product.dto';
import { UpdateProductDto } from '../dtos/requests/update-product.dto';
import { ProductResponseDto } from '../dtos/responses/product-response.dto';
import { ProductPublicDto } from '../dtos/responses/product-public.dto';
import { PaginationParams } from 'src/shared/interfaces/pagination.interface';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.create(createProductDto);
    return new ProductResponseDto(product);
  }

  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return new ProductResponseDto(product);
  }

  async findPublicById(id: number): Promise<ProductPublicDto> {
    const product = await this.productsRepository.findById(id);
    if (!product || !product.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }
    return plainToInstance(ProductPublicDto, product, { excludeExtraneousValues: true });
  }

  async findAll(
    pagination: PaginationParams & {
      category?: string;
      search?: string;
      isActive?: boolean;
    },
  ) {
    const result = await this.productsRepository.findAll(pagination);

    const products = plainToInstance(
      pagination.isActive === false ? ProductResponseDto : ProductPublicDto,
      result.products,
      { excludeExtraneousValues: true },
    );

    return {
      products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
        hasNext: pagination.page * pagination.limit < result.total,
        hasPrev: pagination.page > 1,
      },
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.update(id, updateProductDto);
    return new ProductResponseDto(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.productsRepository.remove(id);
    return { message: 'Producto eliminado exitosamente' };
  }

  async toggleActive(id: number, isActive: boolean): Promise<ProductResponseDto> {
    const product = await this.productsRepository.toggleActive(id, isActive);
    return new ProductResponseDto(product);
  }

  async findByCategory(category: string): Promise<ProductPublicDto[]> {
    const products = await this.productsRepository.findByCategory(category);
    return plainToInstance(ProductPublicDto, products, { excludeExtraneousValues: true });
  }

  async searchProducts(search: string): Promise<ProductPublicDto[]> {
    const products = await this.productsRepository.searchProducts(search);
    return plainToInstance(ProductPublicDto, products, { excludeExtraneousValues: true });
  }
}
