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
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { AddressEntity } from '../entities/address.entity';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async create(
    @Body() dto: CreateAddressDto,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.createAddress(dto, userId);
  }

  @Get()
  async findAll(
    @UserId() userId: number,
    @Query('name') name?: string,
  ): Promise<AddressEntity[]> {
    return name
      ? this.addressService.searchAddresses(userId, name)
      : this.addressService.getAddress(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.getAddressById(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<UpdateAddressDto>,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.updateAddress(id, dto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ): Promise<{ message: string }> {
    return this.addressService.deleteAddress(id, userId);
  }

  @Patch(':id/default')
  async setDefault(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.setDefaultAddress(id, userId);
  }
}
