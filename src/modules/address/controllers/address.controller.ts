import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';


@Controller('addres')
export class AddressController {
  constructor(private readonly addresService: AddressService) {}

  // POST /addres/create
  @Post('create')
  async create(@Body() dto: CreateAddressDto) {
    return this.addresService.createAddres(dto);
  }
  //GET /addres
  @Get()
  async findAll() {
    return this.addresService.getAddres();
  }
}
