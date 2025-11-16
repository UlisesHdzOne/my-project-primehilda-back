import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductQueryService } from '../services/product-query.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productService: ProductService,
    private readonly productQueryService: ProductQueryService,
  ) {}

  // ========== CREATE ==========
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  // ========== READ (LIST / QUERY) ==========
  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productQueryService.findAll(Number(page), Number(limit));
  }

  @Get('active')
  async findActive() {
    return this.productQueryService.findActive();
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    return this.productQueryService.findByCategory(category);
  }

  // ========== READ (SINGLE) ==========
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  // ========== UPDATE ==========
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  // ========== DELETE ==========
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
