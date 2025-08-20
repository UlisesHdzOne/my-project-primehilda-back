import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';

@Controller('addres')
export class AddressController {
  constructor(private readonly addresService: AddressService) {}

  // POST /addres/create
  @Post('create')
  async create(@Body() dto: CreateAddressDto) {
    return this.addresService.createAddress(dto);
  }
  //GET /addres
  @Get()
  async findAll() {
    return this.addresService.getAddress();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.addresService.getAddressById(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto:CreateAddressDto,
  ) {
    return this.addresService.updateAddress(Number(id), dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.addresService.deleteAddress(Number(id));
  }
}
