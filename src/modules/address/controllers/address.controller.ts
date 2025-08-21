import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  constructor(private readonly addresService: AddressService) {}

  // POST /addres/create
  @Post('create')
  async create(@Body() dto: CreateAddressDto, @Req() req: AuthRequest) {
    return this.addresService.createAddress(dto, req.user.id);
  }
  //GET /addres
  @Get()
  async findAll(@Req() req: AuthRequest) {
    return this.addresService.getAddress(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.addresService.getAddressById(Number(id),req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @Req() req: AuthRequest,
  ) {
    return this.addresService.updateAddress(Number(id), dto, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.addresService.deleteAddress(Number(id), req.user.id);
  }
}
