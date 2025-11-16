import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { AddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AddressQueryDto } from '../dto/AddressQueryDto';
import { AddressEntityResponse } from '../entities/AddressEntityResponse';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async createAddress(@Body() dto: AddressDto, @UserId() userId: number) {
    await this.addressService.createAddress(dto, userId);
    return { message: 'Dirección creada exitosamente' };
  }

  // Obtener/Búsqueda/Paginación unificada
  @Get()
  async getAddresses(
    @Query() query: AddressQueryDto,
    @UserId() userId: number,
  ): Promise<AddressEntityResponse> {
    const { q, page = 1, limit = 10 } = query;
    return this.addressService.getAddresses(userId, q, page, limit);
  }

  @Get('search')
  async searchAddresses(
    @UserId() userId: number,
    @Query('q') q: string,
  ): Promise<AddressEntity[]> {
    return this.addressService.searchAddresses(userId, q);
  }
  @Get('default') // ⬅️ AÑADIR ESTA RUTA
  async getDefaultAddress(@UserId() userId: number): Promise<AddressEntity> {
    return this.addressService.getDefaultAddress(userId);
  }

  @Get(':id')
  async getAddressById(
    @Param('id') id: number,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.getAddressById(id, userId);
  }

  @Patch(':id')
  async updateAddress(
    @Param('id') id: number,
    @Body() dto: UpdateAddressDto,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.updateAddress(id, dto, userId);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: number, @UserId() userId: number) {
    await this.addressService.deleteAddress(id, userId);
    return { message: 'Dirección eliminada exitosamente' };
  }

  @Patch(':id/default')
  async setDefaultAddress(
    @Param('id') id: number,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.setDefaultAddress(id, userId);
  }
}
