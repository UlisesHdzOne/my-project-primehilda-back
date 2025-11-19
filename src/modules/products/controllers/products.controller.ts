import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { Public } from 'src/common/guards/jwt-auth.guard';

@Controller('products')
@Public()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({
      page,
      limit,
      category,
      search,
      isActive: true,
    });
  }

  @Get('search')
  async searchProducts(@Query('q') search: string) {
    return this.productsService.searchProducts(search);
  }

  @Get('category/:category')
  async getProductsByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findPublicById(id);
  }
}
