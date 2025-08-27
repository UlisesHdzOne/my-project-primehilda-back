import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt.guard';
import type { AuthRequest } from 'src/types/express';


@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // POST /addresses/
  @Post()
  async create(@Body() dto: CreateAddressDto, @Req() req: AuthRequest) {
    return this.addressService.createAddress(dto, req.user.id);
  }
  //GET /addresses/
  @Get()
  async findAll(@Req() req: AuthRequest) {
    return this.addressService.getAddress(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id',ParseIntPipe) id:number,
     @Req() req: AuthRequest) {
    return this.addressService.getAddressById(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id',ParseIntPipe) id: number,
    @Body() dto: Partial<UpdateAddressDto>,
    @Req() req: AuthRequest,
  ) {
    return this.addressService.updateAddress(dto, req.user.id, id);
  }

  @Delete(':id')
  async delete(
  @Param('id',ParseIntPipe) id: number,
  @Req() req: AuthRequest) {
    return this.addressService.deleteAddress(id, req.user.id);
  }
}
