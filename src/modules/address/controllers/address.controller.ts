import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import type { AuthRequest } from 'src/types/express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async create(@Body() dto: CreateAddressDto, @Req() req: AuthRequest) {
    return this.addressService.createAddress(dto, req.user.id);
  }

  // ✅ Combina las funciones de listar todas y buscar por nombre en un solo endpoint
  // Ejemplos: GET /addresses o GET /addresses?name=mi-casa
  @Get()
  async findAll(@Req() req: AuthRequest, @Query('name') name?: string) {
    if (name) {
      return this.addressService.searchAddresses(req.user.id, name);
    }
    return this.addressService.getAddress(req.user.id);
  }

  @Get('default')
  async getDefault(@Req() req: AuthRequest) {
    const address = await this.addressService.getDefaultAddress(req.user.id);
    return address ?? { message: 'No hay direcciones por defecto' };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.addressService.getAddressById(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<UpdateAddressDto>,
    @Req() req: AuthRequest,
  ) {
    return this.addressService.updateAddress(dto, req.user.id, id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.addressService.deleteAddress(id, req.user.id);
  }

  @Patch(':id/default')
  async setDefault(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.addressService.setDefaultAddress(id, req.user.id);
  }
}
